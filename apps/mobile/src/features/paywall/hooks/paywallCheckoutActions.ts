import { isUnlockAllFeatures } from '@dermis/domain';

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

async function tryGrantDevPro(): Promise<boolean> {
  try {
    await grantDevProEntitlement();
    return true;
  } catch {
    return false;
  }
}

/**
 * Testing / preview: unlock-all always succeeds.
 * No RevenueCat key: try staging POST /v1/dev/entitlements/pro when signed in.
 */
export async function runPaywallPurchase(
  billingEnabled: boolean,
  packages: PaywallPackageMap,
  plan: PlanKind,
): Promise<'billing_off' | 'no_package' | 'cancelled' | 'error' | 'success'> {
  if (isUnlockAllFeatures()) {
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
  if (isUnlockAllFeatures()) {
    await tryGrantDevPro();
    return 'restored';
  }
  if (!billingEnabled) {
    return (await tryGrantDevPro()) ? 'restored' : 'billing_off';
  }
  return restoreRevenueCatPurchases();
}
