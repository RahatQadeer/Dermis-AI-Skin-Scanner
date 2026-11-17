import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { RefObject } from 'react';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useCameraPermissionFlow } from './useCameraPermissions';
import { useLivenessChallenge } from './useLivenessChallenge';
import { useScanCaptureRunner } from './useScanCaptureRunner';

export function useScanCaptureFlow(cameraRef: RefObject<CameraPreviewLiveHandle | null>) {
  const permission = useCameraPermissionFlow();
  const liveness = useLivenessChallenge();
  const runner = useScanCaptureRunner(cameraRef, permission.ensureCamera, liveness);
  const liveCamera = Platform.OS !== 'web';

  useEffect(() => {
    if (liveCamera) {
      void permission.ensureCamera();
    }
  }, [liveCamera, permission]);

  return {
    liveCamera,
    permissionGranted: permission.granted || !liveCamera,
    permissionDenied: liveCamera && permission.denied,
    canAskCameraAgain: permission.canAskAgain,
    requestCamera: permission.ensureCamera,
    capturing: runner.capturing,
    errorToast: runner.errorToast ?? liveness.error,
    clearError: () => {
      runner.setErrorToast(null);
      liveness.clearError();
    },
    runCapture: runner.runCapture,
    livenessPrompt: runner.statusPrompt ?? liveness.prompt,
    livenessRunning: liveness.running,
  };
}
