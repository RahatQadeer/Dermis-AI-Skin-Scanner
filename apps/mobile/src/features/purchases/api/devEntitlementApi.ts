import { getApiClient } from '@/src/lib/api/client';

/** Local/dev Pro unlock when store billing is not configured. */
export async function grantDevProEntitlement(): Promise<'pro'> {
  const res = await getApiClient().post<{ plan: 'free' | 'pro' }>('/v1/dev/entitlements/pro', {});
  if (res.plan !== 'pro') {
    throw new Error('dev_entitlement_failed');
  }
  return 'pro';
}
