/**
 * Local testing: unlock all Pro UI + treat quota as Pro.
 * Set either:
 * - `DERMIS_FORCE_PRO=1` (backend)
 * - `EXPO_PUBLIC_UNLOCK_ALL_FEATURES=1` (Expo / mobile)
 * Never enable in production store builds.
 */
export function isUnlockAllFeatures(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }
  const backend = (process.env.DERMIS_FORCE_PRO ?? '').trim();
  const mobile = (process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES ?? '').trim();
  return backend === '1' || backend === 'true' || mobile === '1' || mobile === 'true';
}
