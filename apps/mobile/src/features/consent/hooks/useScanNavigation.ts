import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useConsent } from '../ConsentContext';
import { scanEntryHref } from '../scanEntry';

export function useScanNavigation() {
  const router = useRouter();
  const consent = useConsent();

  const goScan = useCallback(() => {
    router.push(scanEntryHref(consent.faceAnalysisGranted));
  }, [consent.faceAnalysisGranted, router]);

  return { goScan, faceAnalysisGranted: consent.faceAnalysisGranted, consentReady: consent.ready };
}
