import { useCallback, useEffect, useState } from 'react';

import type { PaywallPackageMap } from '../lib/paywallPackages';
import {
  fetchPaywallPackages,
  logInRevenueCat,
  logOutRevenueCat,
} from '../revenueCat/revenueCatApi';
import { parseMemoryAccessToken } from '@/src/features/session/parseMemoryAccessToken';

const EMPTY_PACKAGES: PaywallPackageMap = { annual: null, monthly: null };

export function usePurchasesPackages(
  billingEnabled: boolean,
  ready: boolean,
  accessToken: string | null,
  userId: string | null,
): { packages: PaywallPackageMap; reloadPackages: () => Promise<void> } {
  const [packages, setPackages] = useState<PaywallPackageMap>(EMPTY_PACKAGES);

  useEffect(() => {
    if (!billingEnabled || !ready) {
      setPackages(EMPTY_PACKAGES);
      return;
    }
    let cancelled = false;
    void (async () => {
      await syncSessionUser(accessToken, userId);
      if (!cancelled) {
        setPackages(await fetchPaywallPackages());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, billingEnabled, ready, userId]);

  const reloadPackages = useCallback(async () => {
    if (!billingEnabled) {
      return;
    }
    setPackages(await fetchPaywallPackages());
  }, [billingEnabled]);

  return { packages, reloadPackages };
}

async function syncSessionUser(accessToken: string | null, userId: string | null): Promise<void> {
  if (!accessToken) {
    await logOutRevenueCat();
    return;
  }
  const id = userId ?? parseMemoryAccessToken(accessToken)?.userId ?? null;
  if (!id) {
    return;
  }
  await logInRevenueCat(id);
}
