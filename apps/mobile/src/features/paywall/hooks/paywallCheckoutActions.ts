import { isFeaturesUnlocked } from '@dermis/domain';

import {
  packageForPlan,
  type PaywallPackageMap,
} from '@/src/features/purchases/lib/paywallPackages';
import { grantDevProEntitlement } from '@/src/features/purchases/api/devEntitlementApi';
import {
  purchaseStorePackage,
  restoreRevenueCatPurchases,
} from '@/src/features/purchases/revenueCat/revenueCatApi';
import type { PlanKind } from '@/src/components/PlanCard';

/** Dev builds only: the backend refuses this grant in production anyway. */
async function tryGrantDevPro(): Promise<boolean> {
  if (!__DEV__) {
    return false;
  }
  try {
    await grantDevProEntitlement();
    return true;
  } catch {
    return false;
  }
}

/**
 * Open billing / unlock-all always succeeds. Dev builds without store billing
 * fall back to POST /v1/dev/entitlements/pro; store mode reports real outcome.
 */
export async function runPaywallPurchase(
  billingEnabled: boolean,
  packages: PaywallPackageMap,
  plan: PlanKind,
): Promise<'billing_off' | 'no_package' | 'cancelled' | 'error' | 'success'> {
  if (isFeaturesUnlocked()) {
    await tryGrantDevPro();
    return 'success';
  }
  if (!billingEnabled) {
    return (await tryGrantDevPro()) ? 'success' : 'billing_off';
  }
  const pkg = packageForPlan(packages, plan);
  if (!pkg) {
    return (await tryGrantDevPro()) ? 'success' : 'no_package';
  }
  const outcome = await purchaseStorePackage(pkg.identifier);
  if (outcome === 'cancelled') {
    return 'cancelled';
  }
  if (outcome === 'error') {
    return (await tryGrantDevPro()) ? 'success' : 'error';
  }
  return 'success';
}

export async function runPaywallRestore(
  billingEnabled: boolean,
): Promise<'billing_off' | 'restored' | 'none' | 'error'> {
  if (isFeaturesUnlocked()) {
    await tryGrantDevPro();
    return 'restored';
  }
  if (!billingEnabled) {
    return (await tryGrantDevPro()) ? 'restored' : 'billing_off';
  }
  return restoreRevenueCatPurchases();
}
