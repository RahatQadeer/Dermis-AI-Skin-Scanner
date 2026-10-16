import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';

import { useConsent } from '../ConsentContext';

export function useAiConsentActions() {
  const router = useRouter();
  const consent = useConsent();
  const s = getCopy().screens.scanConsent;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAllow = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await consent.grantFaceAnalysis();
    setBusy(false);
    if (result !== 'ok') {
      setError(s.consentError);
      return;
    }
    router.replace('/(scan)/camera');
  }, [consent, router, s.consentError]);

  const onDecline = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }, [router]);

  const openPrivacy = useCallback(() => {
    router.push('/(scan)/privacy');
  }, [router]);

  return { busy, error, onAllow, onDecline, openPrivacy, dismissError: () => setError(null) };
}
