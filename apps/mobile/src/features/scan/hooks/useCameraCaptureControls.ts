import { useCallback, useEffect, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import type { LiveScanIssue } from '../lib/liveScanGuidance';
import { useLivePreviewQuality } from './useLivePreviewQuality';
import { useScanCaptureFlow } from './useScanCaptureFlow';

function coachMessage(issue: LiveScanIssue | null): string {
  return issue ? messageForLiveIssue(issue) : getCopy().screens.camera.tip;
}

/**
 * Photo-first scan UX:
 * - Soft live tips only (no continuous identity unlock, no auto-capture).
 * - User taps shutter → we check THAT photo → clear accept/reject message.
 */
export function useCameraCaptureControls(cameraRef: RefObject<CameraPreviewLiveHandle | null>) {
  const [coachToast, setCoachToast] = useState<string | null>(null);
  const [qualityResetToken, setQualityResetToken] = useState(0);
  const capture = useScanCaptureFlow(cameraRef);
  const copy = getCopy().screens.camera;

  const liveQuality = useLivePreviewQuality(
    cameraRef,
    capture.liveCamera && capture.permissionGranted && !capture.capturing,
    qualityResetToken,
  );

  const shutter = useCallback(() => {
    if (capture.capturing || capture.livenessRunning) return;
    void capture.runCapture();
  }, [capture]);

  useEffect(() => {
    if (!capture.errorToast) return;
    setQualityResetToken((n) => n + 1);
  }, [capture.errorToast]);

  const tip = capture.livenessPrompt
    ? capture.livenessPrompt
    : capture.capturing
      ? copy.capturing
      : coachMessage(liveQuality.issue);

  return {
    flashing: false,
    capture,
    afterFlash: () => undefined,
    /** No countdown — shutter takes the photo immediately. */
    countdown: {
      active: false,
      secondsLeft: 0,
      start: () => undefined,
      cancel: () => undefined,
    },
    shutter,
    busy: capture.capturing || capture.livenessRunning,
    liveQuality,
    /** Soft tips only — shutter is never blocked by a live identity gate. */
    captureReady: liveQuality.ready,
    identityChecking: false,
    identityMessage: null as string | null,
    statusMessage: tip,
    coachToast,
    clearCoachToast: () => setCoachToast(null),
  };
}
