import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { fetchFaceReference } from '../api/faceReferenceApi';
import { isFaceIdentityEnabled } from '../lib/faceConfig';
import { readCachedFaceReference } from '../lib/faceReferenceCache';

const FACE_ENROLL_HREF = '/(scan)/face-enroll' as Href;

/**
 * When identity is enabled, analysis camera requires a registered reference.
 * Redirects to enroll without blocking the camera UI on a full-screen loader.
 */
export function useFaceEnrollmentGate(enabled: boolean): { checking: boolean } {
  const router = useRouter();
  const { userId, apiEnabled } = useSession();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!enabled || !isFaceIdentityEnabled() || !apiEnabled || !userId) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const cached = await readCachedFaceReference(userId);
        if (cached || cancelled) {
          return;
        }
        setChecking(true);
        const dto = await fetchFaceReference();
        if (cancelled) return;
        if (!dto.enrolled) {
          router.replace(FACE_ENROLL_HREF);
          return;
        }
      } catch {
        // Capture-time gate still enforces identity.
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, apiEnabled, userId, router]);

  return { checking };
}
