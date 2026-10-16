import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useQuotaRefresh } from '@/src/features/quota/QuotaRefreshContext';
import type { PaywallPackageMap } from '@/src/features/purchases/lib/paywallPackages';
import { getCopy } from '@/src/copy';
import type { PlanKind } from '@/src/components/PlanCard';

import { runPaywallPurchase, runPaywallRestore } from './paywallCheckoutActions';

type CheckoutDeps = {
  billingEnabled: boolean;
  packages: PaywallPackageMap;
  plan: PlanKind;
  showToast: (message: string) => void;
};

export function usePaywallCheckout(deps: CheckoutDeps) {
  const router = useRouter();
  const { bumpQuotaRefresh } = useQuotaRefresh();
  const p = getCopy().paywall;
  const [busy, setBusy] = useState(false);

  const purchase = useCallback(async () => {
    setBusy(true);
    const outcome = await runPaywallPurchase(deps.billingEnabled, deps.packages, deps.plan);
    setBusy(false);
    if (outcome === 'billing_off') {
      deps.showToast(p.billingUnavailable);
      return;
    }
    if (outcome === 'no_package') {
      deps.showToast(p.offeringsUnavailable);
      return;
    }
    if (outcome === 'cancelled' || outcome === 'error') {
      if (outcome === 'error') {
        deps.showToast(p.purchaseError);
      }
      return;
    }
    bumpQuotaRefresh();
    deps.showToast(p.purchaseSuccess);
    navigateAfterCheckout(router);
  }, [bumpQuotaRefresh, deps, p, router]);

  const restore = useCallback(async () => {
    setBusy(true);
    const outcome = await runPaywallRestore(deps.billingEnabled);
    setBusy(false);
    if (outcome === 'billing_off') {
      deps.showToast(p.billingUnavailable);
      return;
    }
    if (outcome === 'restored') {
      bumpQuotaRefresh();
      deps.showToast(p.restoreSuccess);
      return;
    }
    if (outcome === 'none') {
      deps.showToast(p.restoreEmpty);
      return;
    }
    deps.showToast(p.restoreError);
  }, [bumpQuotaRefresh, deps, p]);

  return { busy, purchase, restore };
}

function navigateAfterCheckout(router: ReturnType<typeof useRouter>): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/home');
  }
}
