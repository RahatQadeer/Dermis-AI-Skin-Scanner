import { json } from '../http/respond';
import type { QuotaService } from '../services/quotaService';

export async function handleGetQuota(service: QuotaService, userId: string): Promise<Response> {
  const status = await service.getStatus(userId);
  return json({ quota: status });
}
