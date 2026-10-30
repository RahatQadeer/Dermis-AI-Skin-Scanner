import { useRouter } from 'expo-router';
import { useCallback, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { enrollFaceReference, FaceIdentityError } from '../lib/verifyFaceIdentity';

type CaptureControls = {
  busy: boolean;
  liveQuality: { ready: boolean };
};

/** Capture + persist face reference, then route to camera or profile. */
export function useFaceEnrollCapture(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  controls: CaptureControls,
  replace: boolean,
) {
  const router = useRouter();
  const { userId } = useSession();
  const copy = getCopy().screens.faceEnroll;
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const enroll = useCallback(async () => {
    if (!userId || saving || controls.busy) return;
    if (!controls.liveQuality.ready) {
      setToast(copy.needReady);
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      await captureAndSave(cameraRef, userId, replace, copy.captureFailed);
      router.replace(replace ? '/(tabs)/profile' : '/(scan)/camera');
    } catch (error) {
      setToast(messageFromEnrollError(error, copy.saveFailed));
    } finally {
      setSaving(false);
    }
  }, [userId, saving, controls.busy, controls.liveQuality.ready, copy, router, replace, cameraRef]);

  return { saving, toast, clearToast: () => setToast(null), enroll };
}

async function captureAndSave(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  userId: string,
  replace: boolean,
  captureFailed: string,
): Promise<void> {
  const uri = await cameraRef.current?.takePhoto();
  if (!uri) {
    throw new Error(captureFailed);
  }
  await enrollFaceReference(userId, uri, replace);
}

function messageFromEnrollError(error: unknown, fallback: string): string {
  if (error instanceof FaceIdentityError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}
