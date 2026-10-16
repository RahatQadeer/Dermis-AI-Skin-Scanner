import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type QuotaRefreshContextValue = {
  version: number;
  bumpQuotaRefresh: () => void;
};

const QuotaRefreshContext = createContext<QuotaRefreshContextValue | null>(null);

export function QuotaRefreshProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bumpQuotaRefresh = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => ({ version, bumpQuotaRefresh }), [bumpQuotaRefresh, version]);

  return createElement(QuotaRefreshContext.Provider, { value }, children);
}

export function useQuotaRefresh(): QuotaRefreshContextValue {
  const ctx = useContext(QuotaRefreshContext);
  if (!ctx) {
    throw new Error('useQuotaRefresh requires QuotaRefreshProvider');
  }
  return ctx;
}
