import { useRouter } from 'expo-router';
import { useCallback, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { assessLiveScanFrame } from '../lib/assessLiveScanFrame';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import { messageForFaceSaveError } from '../lib/faceSaveErrors';
import { enrollFaceReference, type FaceEnrollMode } from '../lib/verifyFaceIdentity';

type CaptureControls = {
  busy: boolean;
  liveQuality: { ready: boolean };
};

/** Capture + persist face reference, then route to camera or profile. */
export function useFaceEnrollCapture(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  controls: CaptureControls,
  mode: FaceEnrollMode,
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
      await captureAndSave(cameraRef, userId, mode, copy);
      const toProfile = mode === 'replace' || mode === 'addFace';
      router.replace(toProfile ? '/(tabs)/profile' : '/(scan)/camera');
    } catch (error) {
      setToast(messageForFaceSaveError(error, copy.saveFailed));
    } finally {
      setSaving(false);
    }
  }, [userId, saving, controls.busy, controls.liveQuality.ready, copy, router, mode, cameraRef]);

  return { saving, toast, clearToast: () => setToast(null), enroll };
}

async function captureAndSave(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  userId: string,
  mode: FaceEnrollMode,
  copy: ReturnType<typeof getCopy>['screens']['faceEnroll'],
): Promise<void> {
  const uri = await cameraRef.current?.takePhoto();
  if (!uri) {
    throw new Error(copy.captureFailed);
  }
  const assessment = await assessLiveScanFrame(uri);
  if (!assessment.ok) {
    throw new Error(messageForLiveIssue(assessment.issue));
  }
  await enrollFaceReference(userId, uri, mode, mode === 'replace' ? uri : undefined);
}
