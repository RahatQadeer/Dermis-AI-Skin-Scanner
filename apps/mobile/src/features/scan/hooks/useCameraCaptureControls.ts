import { useCallback, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import type { LiveScanIssue } from '../lib/liveScanGuidance';
import { useAutoCaptureWhenReady } from './useAutoCaptureWhenReady';
import { useCaptureCountdown } from './useCaptureCountdown';
import { useLivePreviewQuality } from './useLivePreviewQuality';
import { useScanCaptureFlow } from './useScanCaptureFlow';

function coachMessage(issue: LiveScanIssue | null): string {
  return issue ? messageForLiveIssue(issue) : getCopy().screens.camera.needReadyToast;
}

export function useCameraCaptureControls(cameraRef: RefObject<CameraPreviewLiveHandle | null>) {
  const [flashing, setFlashing] = useState(false);
  const [coachToast, setCoachToast] = useState<string | null>(null);
  const capture = useScanCaptureFlow(cameraRef);
  const afterFlash = useCallback(() => setFlashing(false), []);

  const beginCapture = useCallback(() => {
    if (flashing || capture.capturing) return;
    setFlashing(true);
    void capture.runCapture();
  }, [flashing, capture]);

  const countdown = useCaptureCountdown(beginCapture);
  const busy = flashing || capture.capturing || countdown.active;
  // Keep sampling during countdown so a green frame is not wiped (that used to cancel auto-take).
  const liveQuality = useLivePreviewQuality(
    cameraRef,
    capture.liveCamera && capture.permissionGranted && !flashing && !capture.capturing,
  );

  useAutoCaptureWhenReady({
    ready: liveQuality.ready,
    busy,
    countdownActive: countdown.active,
    startCountdown: countdown.start,
    cancelCountdown: countdown.cancel,
  });

  const shutter = useCallback(() => {
    if (flashing || capture.capturing || countdown.active) return;
    if (!liveQuality.ready) {
      setCoachToast(coachMessage(liveQuality.issue));
      return;
    }
    countdown.start();
  }, [flashing, capture.capturing, countdown, liveQuality.ready, liveQuality.issue]);

  return {
    flashing,
    capture,
    afterFlash,
    countdown,
    shutter,
    busy,
    liveQuality,
    coachToast,
    clearCoachToast: () => setCoachToast(null),
  };
}
