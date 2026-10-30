export type PlanTier = 'free' | 'pro';

export type EntitlementRecord = {
  userId: string;
  plan: PlanTier;
  proExpiresAt: string | null;
  revenueCatAppUserId: string | null;
  /** event_timestamp_ms of the newest RevenueCat event applied (ordering guard). */
  lastEventAtMs: number | null;
  updatedAt: string;
};

export type EntitlementUpsert = {
  userId: string;
  plan: PlanTier;
  proExpiresAt: string | null;
  revenueCatAppUserId: string;
  lastEventAtMs?: number | null;
};

export type EntitlementRepository = {
  upsert: (input: EntitlementUpsert) => Promise<EntitlementRecord>;
  findByUserId: (userId: string) => Promise<EntitlementRecord | null>;
  deleteByUserId?: (userId: string) => Promise<boolean>;
};

export type WebhookEventRecord = {
  eventId: string;
  provider: string;
  eventType: string;
  appUserId: string | null;
  processedAt: string;
};

export type WebhookEventRepository = {
  /** Returns true if newly recorded; false if already processed (idempotent). */
  tryRecord: (input: {
    eventId: string;
    provider: string;
    eventType: string;
    appUserId: string | null;
    payload: unknown;
  }) => Promise<boolean>;
};
