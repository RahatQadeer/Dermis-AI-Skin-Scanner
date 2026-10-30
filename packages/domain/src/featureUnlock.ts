import { isProductionRuntime, readProcessEnv } from './readProcessEnv';

/**
 * Local testing: unlock all Pro UI + treat quota as Pro.
 * Set either:
 * - `DERMIS_FORCE_PRO=1` (backend)
 * - `EXPO_PUBLIC_UNLOCK_ALL_FEATURES=1` (Expo / mobile)
 * Always false in production (deployed backend, release app bundle).
 */
export function isUnlockAllFeatures(): boolean {
  if (isProductionRuntime()) {
    return false;
  }
  const backend = readProcessEnv('DERMIS_FORCE_PRO');
  const mobile = readProcessEnv('EXPO_PUBLIC_UNLOCK_ALL_FEATURES');
  return backend === '1' || backend === 'true' || mobile === '1' || mobile === 'true';
}
