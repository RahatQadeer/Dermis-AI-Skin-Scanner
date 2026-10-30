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

/**
 * Billing mode for monetization.
 * - unset / `open` → all features free (temporary testing / soft launch)
 * - `store` / `paid` / `closed` → enforce Free vs Pro gates again
 */
export function getBillingMode(): string {
  const backend = readProcessEnv('DERMIS_BILLING_MODE').toLowerCase();
  const mobile = readProcessEnv('EXPO_PUBLIC_BILLING_MODE').toLowerCase();
  return backend || mobile || 'open';
}

/**
 * Durable product switch: all features free, no paywalls.
 * Defaults to open so local/preview testing unlocks everything without env edits.
 * Set mode to `store` when Stripe/RevenueCat billing returns.
 */
export function isBillingOpen(): boolean {
  const mode = getBillingMode();
  return mode !== 'store' && mode !== 'paid' && mode !== 'closed';
}

/** Pro gates, paywalls, and quota locks should not block the user. */
export function isFeaturesUnlocked(): boolean {
  return isBillingOpen() || isUnlockAllFeatures();
}
