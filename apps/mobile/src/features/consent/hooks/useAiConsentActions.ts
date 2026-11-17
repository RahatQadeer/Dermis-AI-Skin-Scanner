import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';
import { isFaceIdentityEnabled } from '@/src/features/scan/lib/faceConfig';
import { resolveFaceEnrolled } from '@/src/features/scan/lib/faceEnrollmentStatus';

import { useConsent } from '../ConsentContext';

export function useAiConsentActions() {
  const router = useRouter();
  const consent = useConsent();
  const { userId, apiEnabled } = useSession();
  const s = getCopy().screens.scanConsent;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAllow = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await consent.grantFaceAnalysis();
    if (result !== 'ok') {
      setBusy(false);
      setError(s.consentError);
      return;
    }
    // Face register once at start — skip setup if already enrolled.
    if (isFaceIdentityEnabled() && apiEnabled && userId) {
      const enrolled = await resolveFaceEnrolled(userId);
      if (enrolled) {
        setBusy(false);
        router.replace('/(scan)/camera' as Href);
        return;
      }
    }
    setBusy(false);
    router.replace('/(scan)/face-setup' as Href);
  }, [consent, router, s.consentError, apiEnabled, userId]);

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
