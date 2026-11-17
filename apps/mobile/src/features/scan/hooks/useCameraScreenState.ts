import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState, type RefObject } from 'react';

import { useConsent } from '@/src/features/consent/ConsentContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useScanCapture } from '../context/ScanCaptureContext';
import { useFaceAnalysisConsentRedirect, useRetakeMessageEffect } from './cameraScreenHelpers';
import { useCameraCaptureControls } from './useCameraCaptureControls';
import { useFaceEnrollmentGate } from './useFaceEnrollmentGate';

export function useCameraScreenState() {
  const router = useRouter();
  const consent = useConsent();
  const { retakeMessage, setRetakeMessage } = useScanCapture();
  const params = useLocalSearchParams<{ retakeMessage?: string | string[] }>();
  const cameraRef = useRef<CameraPreviewLiveHandle>(null);
  const [retakeToast, setRetakeToast] = useState<string | null>(null);
  const controls = useCameraCaptureControls(cameraRef);
  // Pass consent.ready alone — gate stays locked until consent + enroll are resolved
  // (avoids a 1s flash of the scanner before redirecting to face setup).
  const enrollGate = useFaceEnrollmentGate(
    Boolean(consent.ready && consent.faceAnalysisGranted),
  );

  useRetakeMessageEffect(params.retakeMessage, retakeMessage, setRetakeToast, setRetakeMessage);
  useFaceAnalysisConsentRedirect(consent.ready, consent.faceAnalysisGranted, router);

  const clearError = useCallback(() => {
    controls.clearCoachToast();
    setRetakeToast(null);
    setRetakeMessage(null);
    controls.capture.clearError();
  }, [controls, setRetakeMessage]);

  const goBack = useCallback(() => {
    // Always leave the scan funnel — stack.back() often returns to
    // face-setup / consent / analysing, which immediately forwards again
    // and makes Back look broken.
    controls.countdown.cancel();
    router.replace('/(tabs)/home');
  }, [controls.countdown, router]);

  return {
    router,
    goBack,
    cameraRef: cameraRef as RefObject<CameraPreviewLiveHandle | null>,
    flashing: false,
    capture: controls.capture,
    shutter: controls.shutter,
    afterFlash: controls.afterFlash,
    countdown: controls.countdown,
    errorToast: controls.coachToast ?? retakeToast ?? controls.capture.errorToast,
    clearError,
    busy: controls.busy || !enrollGate.cameraAllowed,
    liveQuality: controls.liveQuality,
    captureReady: controls.captureReady && enrollGate.cameraAllowed,
    identityChecking: controls.identityChecking,
    identityMessage: controls.identityMessage,
    statusMessage: controls.statusMessage,
    cameraAllowed: enrollGate.cameraAllowed,
    enrollChecking: enrollGate.checking,
  };
}
