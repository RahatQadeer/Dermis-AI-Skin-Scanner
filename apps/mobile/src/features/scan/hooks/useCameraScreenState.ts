import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState, type RefObject } from 'react';

import { useConsent } from '@/src/features/consent/ConsentContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useScanCapture } from '../context/ScanCaptureContext';
import { useFaceAnalysisConsentRedirect, useRetakeMessageEffect } from './cameraScreenHelpers';
import { useCameraCaptureControls } from './useCameraCaptureControls';

export function useCameraScreenState() {
  const router = useRouter();
  const consent = useConsent();
  const { retakeMessage, setRetakeMessage } = useScanCapture();
  const params = useLocalSearchParams<{ retakeMessage?: string | string[] }>();
  const cameraRef = useRef<CameraPreviewLiveHandle>(null);
  const [retakeToast, setRetakeToast] = useState<string | null>(null);
  const controls = useCameraCaptureControls(cameraRef);

  useRetakeMessageEffect(params.retakeMessage, retakeMessage, setRetakeToast, setRetakeMessage);
  useFaceAnalysisConsentRedirect(consent.ready, consent.faceAnalysisGranted, router);

  const clearError = useCallback(() => {
    controls.clearCoachToast();
    setRetakeToast(null);
    setRetakeMessage(null);
    controls.capture.clearError();
  }, [controls, setRetakeMessage]);

  return {
    router,
    cameraRef: cameraRef as RefObject<CameraPreviewLiveHandle | null>,
    flashing: controls.flashing,
    capture: controls.capture,
    shutter: controls.shutter,
    afterFlash: controls.afterFlash,
    countdown: controls.countdown,
    errorToast: controls.coachToast ?? retakeToast ?? controls.capture.errorToast,
    clearError,
    busy: controls.busy,
    liveQuality: controls.liveQuality,
  };
}
