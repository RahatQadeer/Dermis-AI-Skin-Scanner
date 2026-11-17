import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import type { RefObject } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useScanCapture } from '../context/ScanCaptureContext';
import { isFaceIdentityEnabled } from '../lib/faceConfig';
import { messageForFaceSaveError } from '../lib/faceSaveErrors';
import { verifyFaceIdentity, type FaceBoxNorm } from '../lib/verifyFaceIdentity';
import { captureScanPhoto } from './captureScanPhoto';

type CameraCopy = ReturnType<typeof getCopy>['screens']['camera'];

function assertCanRunCapture(
  userId: string | null | undefined,
  apiEnabled: boolean,
  cameraCopy: CameraCopy,
): asserts userId is string {
  if (!userId) {
    throw new Error(cameraCopy.identityNeedSignIn);
  }
  if (!apiEnabled) {
    throw new Error(cameraCopy.identityNeedNetwork);
  }
  if (!isFaceIdentityEnabled()) {
    throw new Error(cameraCopy.identityUnavailable);
  }
}

function captureErrorMessage(error: unknown, cameraCopy: CameraCopy): string {
  return messageForFaceSaveError(
    error,
    error instanceof Error ? error.message : cameraCopy.captureFailed,
  );
}

type Liveness = {
  completeAfterVerifiedFace: (faceBox: FaceBoxNorm) => Promise<string>;
};

/** Owns capture state + the shutter → verify → liveness → analysing pipeline. */
export function useScanCaptureRunner(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  ensureCamera: () => Promise<boolean>,
  liveness: Liveness,
) {
  const router = useRouter();
  const { setPending, setLastScan } = useScanCapture();
  const { userId, apiEnabled } = useSession();
  const [capturing, setCapturing] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [statusPrompt, setStatusPrompt] = useState<string | null>(null);
  const cameraCopy = getCopy().screens.camera;

  const runCapture = useCallback(async () => {
    setCapturing(true);
    setErrorToast(null);
    setStatusPrompt(cameraCopy.capturing);
    try {
      assertCanRunCapture(userId, apiEnabled, cameraCopy);
      const pending = await captureScanPhoto({
        cameraRef,
        ensureCamera,
        verifyIdentity: (uri) => verifyFaceIdentity(uri, userId),
        completeLiveness: (faceBox) => liveness.completeAfterVerifiedFace(faceBox),
        onStatus: setStatusPrompt,
      });
      setLastScan(null);
      setPending(pending);
      router.replace('/analysing');
    } catch (error) {
      setErrorToast(captureErrorMessage(error, cameraCopy));
      setStatusPrompt(null);
    } finally {
      setCapturing(false);
    }
  }, [
    apiEnabled,
    cameraCopy,
    cameraRef,
    ensureCamera,
    liveness,
    router,
    setLastScan,
    setPending,
    userId,
  ]);

  return { capturing, errorToast, setErrorToast, statusPrompt, runCapture };
}
