import type {
  EntitlementRecord,
  EntitlementRepository,
  EntitlementUpsert,
  PlanTier,
} from './entitlementTypes';

export type SupabaseEntitlementConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type DbRow = {
  user_id: string;
  plan: PlanTier;
  pro_expires_at: string | null;
  revenuecat_app_user_id: string | null;
  updated_at: string;
};

export function createSupabaseEntitlementRepository(
  config: SupabaseEntitlementConfig,
): EntitlementRepository {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/entitlements`;

  const headers = (): HeadersInit => ({
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    'content-type': 'application/json',
    prefer: 'return=representation,resolution=merge-duplicates',
  });

  return {
    async findByUserId(userId) {
      const url = `${base}?user_id=eq.${encodeURIComponent(userId)}&select=*`;
      const response = await fetchImpl(url, { headers: headers() });
      if (!response.ok) {
        return null;
      }
      const rows = (await response.json()) as DbRow[];
      return rows[0] ? fromDb(rows[0]) : null;
    },
    async upsert(input) {
      const response = await fetchImpl(base, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(toDb(input)),
      });
      if (!response.ok) {
        throw new Error('entitlement_upsert_failed');
      }
      const rows = (await response.json()) as DbRow[];
      if (!rows[0]) {
        throw new Error('entitlement_upsert_failed');
      }
      return fromDb(rows[0]);
    },
  };
}

function fromDb(row: DbRow): EntitlementRecord {
  return {
    userId: row.user_id,
    plan: row.plan,
    proExpiresAt: row.pro_expires_at,
    revenueCatAppUserId: row.revenuecat_app_user_id,
    updatedAt: row.updated_at,
  };
}

function toDb(input: EntitlementUpsert): Record<string, unknown> {
  return {
    user_id: input.userId,
    plan: input.plan,
    pro_expires_at: input.proExpiresAt,
    revenuecat_app_user_id: input.revenueCatAppUserId,
  };
}
