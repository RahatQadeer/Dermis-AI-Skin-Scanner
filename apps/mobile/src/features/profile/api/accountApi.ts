import { getApiClient } from '@/src/lib/api/client';

export async function exportAccountData(): Promise<unknown> {
  const res = await getApiClient().get<{ export: unknown }>('/v1/account/export');
  return res.export;
}

export async function deleteAccount(): Promise<void> {
  await getApiClient().delete('/v1/account', { confirmation: 'DELETE' });
}
