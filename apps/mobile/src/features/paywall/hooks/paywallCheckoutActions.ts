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

function isDevRuntime(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__ === true;
}

async function tryDevProUnlock(): Promise<boolean> {
  if (!isDevRuntime()) {
    return false;
  }
  try {
    await grantDevProEntitlement();
    return true;
  } catch {
    return false;
  }
}

export async function runPaywallPurchase(
  billingEnabled: boolean,
  packages: PaywallPackageMap,
  plan: PlanKind,
): Promise<'billing_off' | 'no_package' | 'cancelled' | 'error' | 'success'> {
  if (!billingEnabled) {
    return (await tryDevProUnlock()) ? 'success' : 'billing_off';
  }
  const pkg = packageForPlan(packages, plan);
  if (!pkg) {
    // Misconfigured offerings / Expo Go — unlock Pro locally in __DEV__ only.
    return (await tryDevProUnlock()) ? 'success' : 'no_package';
  }
  const outcome = await purchaseStorePackage(pkg.identifier);
  if (outcome === 'cancelled') {
    return 'cancelled';
  }
  if (outcome === 'error') {
    return 'error';
  }
  return 'success';
}

export async function runPaywallRestore(
  billingEnabled: boolean,
): Promise<'billing_off' | 'restored' | 'none' | 'error'> {
  if (!billingEnabled) {
    return (await tryDevProUnlock()) ? 'restored' : 'billing_off';
  }
  return restoreRevenueCatPurchases();
}
