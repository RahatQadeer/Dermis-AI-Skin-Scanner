import { useEffect, useRef, useState } from 'react';

import { isNativePurchasesEnabled, revenueCatApiKey } from '../config';
import { configureRevenueCat } from '../revenueCat/revenueCatApi';

export function useConfigurePurchases(): { billingEnabled: boolean; ready: boolean } {
  const billingEnabled = isNativePurchasesEnabled();
  const configuredRef = useRef(false);
  const [ready, setReady] = useState(!billingEnabled);

  useEffect(() => {
    if (!billingEnabled || configuredRef.current) {
      return;
    }
    const apiKey = revenueCatApiKey();
    if (!apiKey) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void configureRevenueCat(apiKey).then((result) => {
      if (cancelled) {
        return;
      }
      configuredRef.current = result.ok;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [billingEnabled]);

  return { billingEnabled, ready };
}
