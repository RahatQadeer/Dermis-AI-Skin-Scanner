import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { RefObject } from 'react';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useScanCapture } from '../context/ScanCaptureContext';
import { captureScanPhoto } from './captureScanPhoto';
import { useCameraPermissionFlow } from './useCameraPermissions';

export function useScanCaptureFlow(cameraRef: RefObject<CameraPreviewLiveHandle | null>) {
  const router = useRouter();
  const { setPending, setLastScan } = useScanCapture();
  const permission = useCameraPermissionFlow();
  const [capturing, setCapturing] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const liveCamera = Platform.OS !== 'web';

  useEffect(() => {
    if (liveCamera) {
      void permission.ensureCamera();
    }
  }, [liveCamera, permission]);

  const runCapture = useCallback(async () => {
    setCapturing(true);
    setErrorToast(null);
    try {
      const pending = await captureScanPhoto(cameraRef, permission.ensureCamera);
      // Clear any previous report so a rejected photo cannot reopen old Results.
      setLastScan(null);
      setPending(pending);
      router.replace('/analysing');
    } catch (error) {
      setErrorToast(error instanceof Error ? error.message : 'capture_failed');
    } finally {
      setCapturing(false);
    }
  }, [cameraRef, permission.ensureCamera, router, setLastScan, setPending]);

  return {
    liveCamera,
    permissionGranted: permission.granted || !liveCamera,
    capturing,
    errorToast,
    clearError: () => setErrorToast(null),
    runCapture,
  };
}
