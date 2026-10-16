import { canConsumeScan, isUnlockAllFeatures } from '@dermis/domain/server';

import { HttpError } from '../http/HttpError';
import type { QuotaConsumeResult, QuotaRepository, QuotaStatus } from '../repositories/quotaTypes';

export type QuotaService = {
  getStatus: (userId: string) => Promise<QuotaStatus>;
  consume: (userId: string) => Promise<QuotaConsumeResult>;
  refund: (userId: string) => Promise<void>;
};

export function createQuotaService(repo: QuotaRepository): QuotaService {
  return {
    async getStatus(userId) {
      const status = await repo.getStatus(userId);
      if (!status) {
        throw new HttpError(404, 'quota_not_found');
      }
      if (!isUnlockAllFeatures()) {
        return status;
      }
      const decision = canConsumeScan({
        plan: 'pro',
        lifetimeScanCount: status.lifetimeScanCount,
        dailyScanCount: status.dailyScanCount,
      });
      return {
        ...status,
        plan: 'pro',
        remaining: decision.remaining,
      };
    },
    async consume(userId) {
      return repo.consume(userId);
    },
    async refund(userId) {
      return repo.refund(userId);
    },
  };
}
