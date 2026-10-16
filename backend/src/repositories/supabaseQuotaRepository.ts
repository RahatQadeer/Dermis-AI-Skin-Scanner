import {
  canConsumeScan,
  isUnlockAllFeatures,
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

type EntitlementRow = { plan: Plan };
type UsageRow = {
  lifetime_scan_count: number;
  daily_scan_count: number;
  daily_window_date: string | null;
};

/** Skip SQL RPC when local free-scan raise or force-Pro unlock is on. */
function isRelaxedQuotaPath(): boolean {
  return isUnlockAllFeatures() || resolveFreeLifetimeScans() > 1;
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
  const effectivePlan: Plan = isUnlockAllFeatures() ? 'pro' : plan;
  const decision = canConsumeScan({
    plan: effectivePlan,
    lifetimeScanCount: usage.lifetime_scan_count,
    dailyScanCount: usage.daily_scan_count,
  });
  if (!decision.allowed) {
    return { allowed: false, remaining: 0, reason: decision.reason };
  }

  const today = new Date().toISOString().slice(0, 10);
  const nextUsage =
    effectivePlan === 'pro'
      ? {
          lifetime_scan_count: usage.lifetime_scan_count + 1,
          daily_scan_count:
            usage.daily_window_date === today ? usage.daily_scan_count + 1 : 1,
          daily_window_date: today,
        }
      : {
          lifetime_scan_count: usage.lifetime_scan_count + 1,
        };

  const patchUrl = `${root}/rest/v1/scan_usage?user_id=eq.${encodeURIComponent(userId)}`;
  const patch = await fetchImpl(patchUrl, {
    method: 'PATCH',
    headers: { ...headers(), prefer: 'return=minimal' },
    body: JSON.stringify(nextUsage),
  });
  if (!patch.ok) {
    throw new Error('quota_consume_failed');
  }
  return { allowed: true, remaining: Math.max(0, decision.remaining - 1) };
}

async function fetchPlan(
  fetchImpl: typeof fetch,
  root: string,
  headers: () => HeadersInit,
  userId: string,
): Promise<Plan | null> {
  const url = `${root}/rest/v1/entitlements?user_id=eq.${encodeURIComponent(userId)}&select=plan`;
  const response = await fetchImpl(url, { headers: headers() });
  if (!response.ok) {
    return null;
  }
  const rows = (await response.json()) as EntitlementRow[];
  return rows[0]?.plan ?? null;
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
