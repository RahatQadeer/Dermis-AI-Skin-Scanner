import { useCallback, useEffect, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useCameraPermissionFlow } from './useCameraPermissions';
import { useLivePreviewQuality } from './useLivePreviewQuality';
import { assessLiveScanFrame } from '../lib/assessLiveScanFrame';
import { isFaceEmbedderReady, preloadFaceEmbedder } from '../lib/faceEmbedder';
import { markFaceEnrolledLocally } from '../lib/faceEnrollmentStatus';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import type { LiveScanIssue } from '../lib/liveScanGuidance';
import { messageForFaceSaveError } from '../lib/faceSaveErrors';
import { enrollFaceReference, type FaceEnrollMode } from '../lib/verifyFaceIdentity';

/** Capture + save selfie reference for the signed-in user. */
export function useFaceSelfieRegister(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  mode: FaceEnrollMode,
) {
  const { userId } = useSession();
  const permission = useCameraPermissionFlow();
  const copy = getCopy().screens.faceEnroll;
  const [modelReady, setModelReady] = useState(isFaceEmbedderReady());
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const liveQuality = useLivePreviewQuality(cameraRef, permission.granted && !saving && !done);

  useEffect(() => {
    void permission.ensureCamera();
    void preloadFaceEmbedder().finally(() => setModelReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount warm-up only
  }, []);

  const register = useCallback(async () => {
    if (!userId || saving) return;
    if (!liveQuality.ready) {
      setToast(framingMessage(liveQuality.issue, copy));
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      await prepareEmbedder(copy, setToast);
      await captureAssessAndSave(cameraRef, userId, mode, copy);
      await markFaceEnrolledLocally(userId);
      setDone(true);
    } catch (error) {
      setToast(messageForFaceSaveError(error, copy.saveFailed));
    } finally {
      setSaving(false);
    }
  }, [userId, saving, cameraRef, mode, copy, liveQuality.ready, liveQuality.issue]);

  return {
    permissionGranted: permission.granted,
    /** Register only when face framing is clearly OK. */
    ready: permission.granted && liveQuality.ready,
    framingReady: liveQuality.ready,
    liveIssue: liveQuality.issue,
    modelReady,
    saving,
    done,
    toast,
    clearToast: () => setToast(null),
    register,
  };
}

type FaceEnrollCopy = ReturnType<typeof getCopy>['screens']['faceEnroll'];

function framingMessage(issue: LiveScanIssue | null, copy: FaceEnrollCopy): string {
  return issue ? messageForLiveIssue(issue) : copy.needClearFace;
}

async function prepareEmbedder(
  copy: FaceEnrollCopy,
  setToast: (message: string | null) => void,
): Promise<void> {
  if (!isFaceEmbedderReady()) {
    setToast(copy.preparingModel);
    await preloadFaceEmbedder();
  }
}

async function captureAssessAndSave(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  userId: string,
  mode: FaceEnrollMode,
  copy: FaceEnrollCopy,
): Promise<void> {
  const uri = await cameraRef.current?.takePhoto();
  if (!uri) {
    throw new Error(copy.captureFailed);
  }
  const assessment = await assessLiveScanFrame(uri);
  if (!assessment.ok) {
    throw new Error(
      assessment.issue ? messageForLiveIssue(assessment.issue) : copy.needClearFace,
    );
  }
  // Same-person replace proves with this capture; addFace does not need old-face proof.
  await enrollFaceReference(userId, uri, mode, mode === 'replace' ? uri : undefined);
}
