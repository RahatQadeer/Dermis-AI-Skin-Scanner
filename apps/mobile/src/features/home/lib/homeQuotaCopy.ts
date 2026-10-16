import { canConsumeScan, type QuotaState } from '@dermis/domain/server';

export type HomeQuotaCopy = {
  planFree: string;
  planPro: string;
  scansRemainingFree: (n: number) => string;
  scansRemainingPro: (n: number) => string;
  quotaLimitFree: string;
  quotaLimitPro: string;
};

export type QuotaRowView = {
  planLabel: string;
  scanLine: string;
  atLimit: boolean;
};

export function buildQuotaRowView(state: QuotaState, copy: HomeQuotaCopy): QuotaRowView {
  const planLabel = state.plan === 'pro' ? copy.planPro : copy.planFree;
  const decision = canConsumeScan(state);

  if (!decision.allowed) {
    const scanLine = decision.reason === 'daily_limit' ? copy.quotaLimitPro : copy.quotaLimitFree;
    return { planLabel, scanLine, atLimit: true };
  }

  const scanLine =
    state.plan === 'pro'
      ? copy.scansRemainingPro(decision.remaining)
      : copy.scansRemainingFree(decision.remaining);

  return { planLabel, scanLine, atLimit: false };
}
