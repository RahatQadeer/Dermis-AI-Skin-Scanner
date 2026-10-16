import type {
  EntitlementRecord,
  EntitlementRepository,
  EntitlementUpsert,
  WebhookEventRepository,
} from './entitlementTypes';

function nowIso(): string {
  return new Date().toISOString();
}

export function createMemoryEntitlementRepository(
  seed: Iterable<EntitlementRecord> = [],
): EntitlementRepository {
  const store = new Map<string, EntitlementRecord>();
  for (const row of seed) {
    store.set(row.userId, structuredClone(row));
  }

  return {
    async findByUserId(userId) {
      const row = store.get(userId);
      return row ? structuredClone(row) : null;
    },
    async upsert(input: EntitlementUpsert) {
      const next: EntitlementRecord = {
        userId: input.userId,
        plan: input.plan,
        proExpiresAt: input.proExpiresAt,
        revenueCatAppUserId: input.revenueCatAppUserId,
        updatedAt: nowIso(),
      };
      store.set(input.userId, next);
      return structuredClone(next);
    },
    async deleteByUserId(userId) {
      return store.delete(userId);
    },
  };
}

export function createMemoryWebhookEventRepository(): WebhookEventRepository {
  const seen = new Set<string>();

  return {
    async tryRecord(input) {
      if (seen.has(input.eventId)) {
        return false;
      }
      seen.add(input.eventId);
      return true;
    },
  };
}
