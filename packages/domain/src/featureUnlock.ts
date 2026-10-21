import { readProcessEnv } from './readProcessEnv';

/**
 * Local testing: unlock all Pro UI + treat quota as Pro.
 * Set either:
 * - `DERMIS_FORCE_PRO=1` (backend)
 * - `EXPO_PUBLIC_UNLOCK_ALL_FEATURES=1` (Expo / mobile)
 * Never enable in production store builds.
 */
export function isUnlockAllFeatures(): boolean {
  const backend = readProcessEnv('DERMIS_FORCE_PRO');
  const mobile = readProcessEnv('EXPO_PUBLIC_UNLOCK_ALL_FEATURES');
  return backend === '1' || backend === 'true' || mobile === '1' || mobile === 'true';
}
