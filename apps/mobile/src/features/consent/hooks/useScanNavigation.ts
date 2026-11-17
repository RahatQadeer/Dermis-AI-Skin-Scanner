import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';

import { useSession } from '@/src/features/session/SessionContext';
import { isFaceIdentityEnabled } from '@/src/features/scan/lib/faceConfig';
import { resolveFaceEnrolled } from '@/src/features/scan/lib/faceEnrollmentStatus';

import { useConsent } from '../ConsentContext';
import { scanEntryHref } from '../scanEntry';

/**
 * Opens the correct first scan step: consent → face setup (once) → camera.
 */
export function useScanNavigation() {
  const router = useRouter();
  const consent = useConsent();
  const { userId, apiEnabled } = useSession();

  const goScan = useCallback(() => {
    void (async () => {
      if (!consent.faceAnalysisGranted) {
        router.push(scanEntryHref(false));
        return;
      }
      if (isFaceIdentityEnabled() && apiEnabled && userId) {
        const enrolled = await resolveFaceEnrolled(userId);
        if (!enrolled) {
          router.push('/(scan)/face-setup' as Href);
          return;
        }
      }
      router.push(scanEntryHref(true));
    })();
  }, [consent.faceAnalysisGranted, apiEnabled, userId, router]);

  return { goScan, faceAnalysisGranted: consent.faceAnalysisGranted, consentReady: consent.ready };
}
