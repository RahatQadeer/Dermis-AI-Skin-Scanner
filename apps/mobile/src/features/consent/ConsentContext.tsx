import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { grantFaceConsent } from './grantFaceConsent';
import { loadFaceConsent } from './loadFaceConsent';

type ConsentContextValue = {
  ready: boolean;
  faceAnalysisGranted: boolean;
  refreshConsent: () => Promise<void>;
  grantFaceAnalysis: () => Promise<'ok' | 'error'>;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const apiLive = session.apiEnabled && Boolean(session.accessToken);
  const [ready, setReady] = useState(false);
  const [faceAnalysisGranted, setGranted] = useState(false);

  const refreshConsent = useCallback(async () => {
    const granted = await loadFaceConsent(apiLive);
    setGranted(granted);
    setReady(true);
  }, [apiLive]);

  useEffect(() => {
    void refreshConsent();
  }, [refreshConsent]);

  const grantFaceAnalysis = useCallback(async () => {
    // Re-read session gate at click time (avoid stale apiLive / missing token).
    const live = session.apiEnabled && Boolean(session.accessToken);
    const result = await grantFaceConsent(live);
    if (result === 'ok') {
      setGranted(true);
    }
    return result;
  }, [session.accessToken, session.apiEnabled]);

  const value = useMemo(
    (): ConsentContextValue => ({
      ready,
      faceAnalysisGranted,
      refreshConsent,
      grantFaceAnalysis,
    }),
    [faceAnalysisGranted, grantFaceAnalysis, ready, refreshConsent],
  );

  return createElement(ConsentContext.Provider, { value }, children);
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent requires ConsentProvider');
  }
  return ctx;
}
