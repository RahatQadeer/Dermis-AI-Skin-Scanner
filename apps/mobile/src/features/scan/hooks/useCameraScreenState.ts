import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { useConsent } from '@/src/features/consent/ConsentContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { useCaptureCountdown } from './useCaptureCountdown';
import { useScanCaptureFlow } from './useScanCaptureFlow';

export function useCameraScreenState() {
  const router = useRouter();
  const consent = useConsent();
  const params = useLocalSearchParams<{ retakeMessage?: string | string[] }>();
  const cameraRef = useRef<CameraPreviewLiveHandle>(null);
  const [flashing, setFlashing] = useState(false);
  const [retakeToast, setRetakeToast] = useState<string | null>(null);
  const capture = useScanCaptureFlow(cameraRef);

  useRetakeMessageEffect(params.retakeMessage, setRetakeToast);
  useFaceAnalysisConsentRedirect(consent.ready, consent.faceAnalysisGranted, router);

  const afterFlash = useCallback(() => {
    setFlashing(false);
    void capture.runCapture();
  }, [capture]);

  const beginCapture = useCallback(() => {
    if (!flashing && !capture.capturing) {
      setFlashing(true);
    }
  }, [flashing, capture.capturing]);

  const countdown = useCaptureCountdown(beginCapture);

  const shutter = useCallback(() => {
    if (flashing || capture.capturing || countdown.active) {
      return;
    }
    countdown.start();
  }, [countdown, flashing, capture.capturing]);

  const errorToast = retakeToast ?? capture.errorToast;
  const clearError = useCallback(() => {
    setRetakeToast(null);
    capture.clearError();
  }, [capture]);

  return {
    router,
    cameraRef: cameraRef as RefObject<CameraPreviewLiveHandle | null>,
    flashing,
    capture,
    shutter,
    afterFlash,
    countdown,
    errorToast,
    clearError,
    busy: flashing || capture.capturing || countdown.active,
  };
}

function useRetakeMessageEffect(
  raw: string | string[] | undefined,
  setRetakeToast: (v: string) => void,
): void {
  useEffect(() => {
    const message = Array.isArray(raw) ? raw[0] : raw;
    if (message) {
      setRetakeToast(message);
    }
  }, [raw, setRetakeToast]);
}

function useFaceAnalysisConsentRedirect(
  ready: boolean,
  faceAnalysisGranted: boolean,
  router: ReturnType<typeof useRouter>,
): void {
  useEffect(() => {
    if (ready && !faceAnalysisGranted) {
      router.replace('/(scan)/ai-consent');
    }
  }, [faceAnalysisGranted, ready, router]);
}
