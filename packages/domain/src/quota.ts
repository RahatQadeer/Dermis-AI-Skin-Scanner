import { PRO_DAILY_SCANS, resolveFreeLifetimeScans } from './constants';

export type Plan = 'free' | 'pro';

export type QuotaState = {
  plan: Plan;
  /** Total scans ever for free tier. */
  lifetimeScanCount: number;
  /** Scans used today for Pro (server day boundary). */
  dailyScanCount: number;
};

export type QuotaDecision =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; reason: 'free_limit' | 'daily_limit' };

/**
 * Whether the user may start another scan. Server-authoritative.
 */
export function canConsumeScan(state: QuotaState): QuotaDecision {
  if (state.plan === 'free') {
    const remaining = Math.max(0, resolveFreeLifetimeScans() - state.lifetimeScanCount);
    if (remaining <= 0) {
      return { allowed: false, remaining: 0, reason: 'free_limit' };
    }
    return { allowed: true, remaining };
  }

  const remaining = Math.max(0, PRO_DAILY_SCANS - state.dailyScanCount);
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, reason: 'daily_limit' };
  }
  return { allowed: true, remaining };
}

export function remainingScans(state: QuotaState): number {
  return canConsumeScan(state).remaining;
}
