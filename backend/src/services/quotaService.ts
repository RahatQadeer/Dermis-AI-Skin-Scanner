import { isFeaturesUnlocked } from '@dermis/domain/server';

import { HttpError } from '../http/HttpError';
import type { QuotaConsumeResult, QuotaRepository, QuotaStatus } from '../repositories/quotaTypes';

/** Open billing / unlock-all — never block scanning. */
const UNLOCK_REMAINING = 9999;

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
      if (isFeaturesUnlocked()) {
        return {
          ...status,
          plan: 'pro',
          remaining: UNLOCK_REMAINING,
        };
      }
      return status;
    },
    async consume(userId) {
      if (isFeaturesUnlocked()) {
        const result = await repo.consume(userId);
        // Even if the DB daily counter is full, allow more scans in open mode.
        if (!result.allowed) {
          return { allowed: true, remaining: UNLOCK_REMAINING };
        }
        return { allowed: true, remaining: UNLOCK_REMAINING };
      }
      return repo.consume(userId);
    },
    async refund(userId) {
      return repo.refund(userId);
    },
  };
}
