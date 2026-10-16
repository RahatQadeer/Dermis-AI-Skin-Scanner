import { useCallback, useMemo, useState } from 'react';

import { usePurchases } from '@/src/features/purchases/context/PurchasesContext';
import { savingsBadgeLabel } from '@/src/copy/paywall';
import type { PlanKind } from '@/src/components/PlanCard';
import { computeSavingsPercent } from '@/src/lib/planSavings';
import { getCopy } from '@/src/copy';

import { MOCK_STORE_PRICES } from '../mock/mockStorePrices';
import { usePaywallCheckout } from './usePaywallCheckout';

export function usePaywallSelection() {
  const p = getCopy().paywall;
  const { billingEnabled, packages } = usePurchases();
  const [plan, setPlan] = useState<PlanKind>('annual');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const annualAmount = packages.annual?.priceAmount ?? MOCK_STORE_PRICES.annualAmount;
  const monthlyAmount = packages.monthly?.priceAmount ?? MOCK_STORE_PRICES.monthlyAmount;
  const annualPriceLabel = packages.annual?.priceString ?? p.mockPriceAnnual;
  const monthlyPriceLabel = packages.monthly?.priceString ?? p.mockPriceMonthly;

  const savingsPercent = useMemo(
    () => computeSavingsPercent(annualAmount, monthlyAmount),
    [annualAmount, monthlyAmount],
  );
  const badgeLabel = savingsPercent !== null ? savingsBadgeLabel(savingsPercent) : undefined;

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  const checkout = usePaywallCheckout({
    billingEnabled,
    packages,
    plan,
    showToast,
  });

  return {
    plan,
    setPlan,
    badgeLabel,
    annualPriceLabel,
    monthlyPriceLabel,
    toastMessage,
    toastVisible,
    showToast,
    dismissToast,
    busy: checkout.busy,
    purchase: checkout.purchase,
    restore: checkout.restore,
  };
}
