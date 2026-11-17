import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { preloadFaceEmbedder } from '../lib/faceEmbedder';
import { resolveFaceEnrolled } from '../lib/faceEnrollmentStatus';

const CAMERA_HREF = '/(scan)/camera' as Href;

/**
 * Warms the face model and skips the intro for already-enrolled users.
 * Returns `true` while the enrollment check is in flight.
 */
export function useFaceSetupCheck(): boolean {
  const router = useRouter();
  const { userId } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void preloadFaceEmbedder();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!userId) {
        if (!cancelled) setChecking(false);
        return;
      }
      const enrolled = await resolveFaceEnrolled(userId);
      if (cancelled) return;
      if (enrolled) {
        // Already registered — never ask again; go straight to scan.
        router.replace(CAMERA_HREF);
        return;
      }
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, router]);

  return checking;
}
