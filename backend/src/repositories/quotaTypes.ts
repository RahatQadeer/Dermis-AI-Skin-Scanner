import type { Plan } from '@dermis/domain/server';

export type QuotaReason = 'free_limit' | 'daily_limit' | 'no_entitlement' | 'no_usage_row';

export type QuotaConsumeResult =
  { allowed: true; remaining: number } | { allowed: false; remaining: 0; reason: QuotaReason };

export type QuotaStatus = {
  plan: Plan;
  lifetimeScanCount: number;
  dailyScanCount: number;
  dailyWindowDate: string | null;
  remaining: number;
};

export type QuotaRepository = {
  getStatus: (userId: string) => Promise<QuotaStatus | null>;
  /** Atomic check-and-increment. Must be safe under concurrent callers. */
  consume: (userId: string) => Promise<QuotaConsumeResult>;
  /** Undo a successful consume (scan insert rollback). */
  refund: (userId: string) => Promise<void>;
  /** Test/setup helper — production uses entitlements webhook. */
  setPlan?: (userId: string, plan: Plan) => Promise<void>;
  deleteByUserId?: (userId: string) => Promise<boolean>;
};
