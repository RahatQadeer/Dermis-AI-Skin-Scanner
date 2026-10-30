import { useCallback, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import type { LiveScanIssue } from '../lib/liveScanGuidance';
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

  // Countdown retained for UI compatibility; shutter captures immediately (no auto).
  const countdown = useCaptureCountdown(beginCapture);
  const busy = flashing || capture.capturing || countdown.active;
  const liveQuality = useLivePreviewQuality(
    cameraRef,
    capture.liveCamera &&
      capture.permissionGranted &&
      !flashing &&
      !capture.capturing &&
      !countdown.active,
  );

  const shutter = useCallback(() => {
    if (flashing || capture.capturing || countdown.active) return;
    if (!liveQuality.ready) {
      setCoachToast(coachMessage(liveQuality.issue));
      return;
    }
    beginCapture();
  }, [flashing, capture.capturing, countdown.active, liveQuality.ready, liveQuality.issue, beginCapture]);

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
