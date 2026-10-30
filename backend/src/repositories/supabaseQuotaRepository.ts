import {
  canConsumeScan,
  isFeaturesUnlocked,
  resolveFreeLifetimeScans,
  type Plan,
} from '@dermis/domain/server';
import { z } from 'zod';

import type { QuotaRepository, QuotaStatus } from './quotaTypes';

export type SupabaseQuotaConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

const consumeResultSchema = z.discriminatedUnion('allowed', [
  z.object({ allowed: z.literal(true), remaining: z.number().int().nonnegative() }),
  z.object({
    allowed: z.literal(false),
    remaining: z.literal(0),
    reason: z.enum(['free_limit', 'daily_limit', 'no_entitlement', 'no_usage_row']),
  }),
]);

type EntitlementRow = { plan: Plan; pro_expires_at?: string | null };

/** Pro with a past expiry is treated as free. */
export function planAfterExpiry(
  plan: Plan,
  proExpiresAt: string | null | undefined,
  now: Date,
): Plan {
  if (plan === 'pro' && proExpiresAt && Date.parse(proExpiresAt) <= now.getTime()) {
    return 'free';
  }
  return plan;
}
type UsageRow = {
  lifetime_scan_count: number;
  daily_scan_count: number;
  daily_window_date: string | null;
};

/** Skip SQL RPC when open billing, unlock-all, or raised free lifetime is on. */
function isRelaxedQuotaPath(): boolean {
  return isFeaturesUnlocked() || resolveFreeLifetimeScans() > 1;
}

export function createSupabaseQuotaRepository(config: SupabaseQuotaConfig): QuotaRepository {
  const fetchImpl = config.fetchImpl ?? fetch;
  const root = config.supabaseUrl.replace(/\/$/, '');

  const headers = (): HeadersInit => ({
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    'content-type': 'application/json',
  });

  return {
    async getStatus(userId) {
      await ensureBillingRows(fetchImpl, root, headers, userId);
      const [plan, usage] = await Promise.all([
        fetchPlan(fetchImpl, root, headers, userId),
        fetchUsage(fetchImpl, root, headers, userId),
      ]);
      if (!plan || !usage) {
        return null;
      }
      return toStatus(plan, usage);
    },
    async consume(userId) {
      await ensureBillingRows(fetchImpl, root, headers, userId);
      if (isRelaxedQuotaPath()) {
        return consumeRelaxed(fetchImpl, root, headers, userId);
      }
      const response = await fetchImpl(`${root}/rest/v1/rpc/consume_scan_quota`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ p_user_id: userId }),
      });
      if (!response.ok) {
        throw new Error('quota_consume_failed');
      }
      const raw: unknown = await response.json();
      const parsed = consumeResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error('quota_consume_invalid_response');
      }
      return parsed.data;
    },
    async refund() {
      // TODO(spec): SQL refund_scan_quota when scan insert fails after consume.
      // Do not throw — a failed refund must not hide the original insert error.
    },
  };
}

/** Signup trigger can miss rows (admin create / older accounts) — heal on first use. */
async function ensureBillingRows(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<void> {
  const [plan, usage] = await Promise.all([
    fetchPlan(fetchImpl, root, headers, userId),
    fetchUsage(fetchImpl, root, headers, userId),
  ]);
  if (!plan) {
    await upsertEntitlement(fetchImpl, root, headers, userId);
  }
  if (!usage) {
    const lifetime = await countScans(fetchImpl, root, headers, userId);
    await upsertUsage({ fetchImpl, root, headers, userId, lifetimeScanCount: lifetime });
  }
}

type QuotaRestCtx = {
  fetchImpl: typeof fetch;
  root: string;
  headers: () => HeadersInit;
  userId: string;
};

async function upsertEntitlement(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<void> {
  await fetchImpl(`${root}/rest/v1/entitlements`, {
    method: 'POST',
    headers: { ...headers(), prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, plan: 'free' }),
  });
}

async function upsertUsage(ctx: QuotaRestCtx & { lifetimeScanCount: number }): Promise<void> {
  await ctx.fetchImpl(`${ctx.root}/rest/v1/scan_usage`, {
    method: 'POST',
    headers: { ...ctx.headers(), prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({
      user_id: ctx.userId,
      lifetime_scan_count: ctx.lifetimeScanCount,
      daily_scan_count: 0,
      daily_window_date: null,
    }),
  });
}

async function countScans(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<number> {
  const url = `${root}/rest/v1/scans?user_id=eq.${encodeURIComponent(userId)}` + `&select=id`;
  const response = await fetchImpl(url, {
    headers: { ...headers(), prefer: 'count=exact' },
  });
  if (!response.ok) {
    return 0;
  }
  const contentRange = response.headers.get('content-range');
  const total = contentRange?.split('/')[1];
  if (total && total !== '*') {
    const n = Number(total);
    return Number.isFinite(n) ? n : 0;
  }
  const rows = (await response.json()) as unknown[];
  return Array.isArray(rows) ? rows.length : 0;
}

async function consumeRelaxed(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<z.infer<typeof consumeResultSchema>> {
  const [plan, usage] = await Promise.all([
    fetchPlan(fetchImpl, root, headers, userId),
    fetchUsage(fetchImpl, root, headers, userId),
  ]);
  if (!plan) {
    return { allowed: false, remaining: 0, reason: 'no_entitlement' };
  }
  if (!usage) {
    return { allowed: false, remaining: 0, reason: 'no_usage_row' };
  }
  const unlocked = isFeaturesUnlocked();
  const effectivePlan: Plan = unlocked ? 'pro' : plan;
  const decision = canConsumeScan({
    plan: effectivePlan,
    lifetimeScanCount: usage.lifetime_scan_count,
    dailyScanCount: usage.daily_scan_count,
  });
  if (!unlocked && !decision.allowed) {
    return { allowed: false, remaining: 0, reason: decision.reason };
  }
  await patchUsageIncrement({
    fetchImpl,
    root,
    headers,
    userId,
    effectivePlan,
    usage,
  });
  if (unlocked) {
    return { allowed: true, remaining: 9999 };
  }
  return { allowed: true, remaining: Math.max(0, decision.remaining - 1) };
}

async function patchUsageIncrement(ctx: {
  fetchImpl: typeof fetch;
  root: string;
  headers: () => HeadersInit;
  userId: string;
  effectivePlan: Plan;
  usage: UsageRow;
}): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const nextUsage =
    ctx.effectivePlan === 'pro'
      ? {
          lifetime_scan_count: ctx.usage.lifetime_scan_count + 1,
          daily_scan_count:
            ctx.usage.daily_window_date === today ? ctx.usage.daily_scan_count + 1 : 1,
          daily_window_date: today,
        }
      : { lifetime_scan_count: ctx.usage.lifetime_scan_count + 1 };
  const patch = await ctx.fetchImpl(
    `${ctx.root}/rest/v1/scan_usage?user_id=eq.${encodeURIComponent(ctx.userId)}`,
    {
      method: 'PATCH',
      headers: { ...ctx.headers(), prefer: 'return=minimal' },
      body: JSON.stringify(nextUsage),
    },
  );
  if (!patch.ok) {
    throw new Error('quota_consume_failed');
  }
}

async function fetchPlan(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<Plan | null> {
  const url =
    `${root}/rest/v1/entitlements?user_id=eq.${encodeURIComponent(userId)}` +
    `&select=plan,pro_expires_at`;
  const response = await fetchImpl(url, { headers: headers() });
  if (!response.ok) {
    return null;
  }
  const rows = (await response.json()) as EntitlementRow[];
  const row = rows[0];
  if (!row) {
    return null;
  }
  // Mirrors consume_scan_quota: Pro lapses at pro_expires_at even if the
  // EXPIRATION webhook never arrived.
  return planAfterExpiry(row.plan, row.pro_expires_at, new Date());
}

async function fetchUsage(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<UsageRow | null> {
  const url = `${root}/rest/v1/scan_usage?user_id=eq.${encodeURIComponent(userId)}&select=*`;
  const response = await fetchImpl(url, { headers: headers() });
  if (!response.ok) {
    return null;
  }
  const rows = (await response.json()) as UsageRow[];
  return rows[0] ?? null;
}

function toStatus(plan: Plan, usage: UsageRow): QuotaStatus {
  const decision = canConsumeScan({
    plan,
    lifetimeScanCount: usage.lifetime_scan_count,
    dailyScanCount: usage.daily_scan_count,
  });
  return {
    plan,
    lifetimeScanCount: usage.lifetime_scan_count,
    dailyScanCount: usage.daily_scan_count,
    dailyWindowDate: usage.daily_window_date,
    remaining: decision.remaining,
  };
}
