import { getApiClient } from '@/src/lib/api/client';

export type QuotaDto = {
  plan: 'free' | 'pro';
  lifetimeScanCount: number;
  dailyScanCount: number;
  dailyWindowDate: string | null;
  remaining: number;
};

export async function fetchQuota(): Promise<QuotaDto> {
  const res = await getApiClient().get<{ quota: QuotaDto }>('/v1/quota');
  return res.quota;
}
