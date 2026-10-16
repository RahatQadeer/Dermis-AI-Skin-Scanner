import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { useConfigurePurchases } from '../hooks/useConfigurePurchases';
import { usePurchasesPackages } from '../hooks/usePurchasesPackages';
import type { PaywallPackageMap } from '../lib/paywallPackages';

type PurchasesContextValue = {
  ready: boolean;
  billingEnabled: boolean;
  packages: PaywallPackageMap;
  reloadPackages: () => Promise<void>;
};

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const { billingEnabled, ready } = useConfigurePurchases();
  const { packages, reloadPackages } = usePurchasesPackages(
    billingEnabled,
    ready,
    session.accessToken,
    session.userId,
  );

  const value = useMemo(
    (): PurchasesContextValue => ({
      ready,
      billingEnabled,
      packages,
      reloadPackages,
    }),
    [billingEnabled, packages, ready, reloadPackages],
  );

  return createElement(PurchasesContext.Provider, { value }, children);
}

export function usePurchases(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) {
    throw new Error('usePurchases requires PurchasesProvider');
  }
  return ctx;
}
