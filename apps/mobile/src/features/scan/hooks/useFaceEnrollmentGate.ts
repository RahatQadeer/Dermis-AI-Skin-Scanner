import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { isFaceIdentityEnabled } from '../lib/faceConfig';
import { resolveFaceEnrolled } from '../lib/faceEnrollmentStatus';

const FACE_SETUP_HREF = '/(scan)/face-setup' as Href;

/**
 * Analysis camera requires a registered face (when identity is on).
 * Never flash the scanner while consent/enroll status is still resolving.
 */
export function useFaceEnrollmentGate(consentReady: boolean): {
  checking: boolean;
  cameraAllowed: boolean;
} {
  const router = useRouter();
  const { userId, apiEnabled } = useSession();
  const identityOn = isFaceIdentityEnabled() && apiEnabled && Boolean(userId);
  // Default locked — unlocking early was flashing the scanner for a second.
  const [checking, setChecking] = useState(true);
  const [cameraAllowed, setCameraAllowed] = useState(false);

  useEffect(() => {
    if (!consentReady) {
      setChecking(true);
      setCameraAllowed(false);
      return;
    }
    if (!identityOn || !userId) {
      setChecking(false);
      setCameraAllowed(true);
      return;
    }

    let cancelled = false;
    setChecking(true);
    setCameraAllowed(false);
    void (async () => {
      const enrolled = await resolveFaceEnrolled(userId);
      if (cancelled) return;
      if (!enrolled) {
        router.replace(FACE_SETUP_HREF);
        setChecking(false);
        return;
      }
      setCameraAllowed(true);
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [consentReady, identityOn, userId, router]);

  return { checking, cameraAllowed };
}
