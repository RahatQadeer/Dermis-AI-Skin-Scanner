import { useEffect, useRef, useState, type RefObject } from 'react';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { assessLiveScanFrame } from '../lib/assessLiveScanFrame';
import { getFaceDetector } from '../lib/faceDetectorSingleton';
import type { LiveScanAssessment, LiveScanIssue } from '../lib/liveScanGuidance';
import {
  initialHysteresisState,
  nextHysteresis,
  type HysteresisState,
} from './livePreviewHysteresis';

/** Snappy first check; light sampling after so capture feels instant. */
const WARMUP_MS = 200;
const INTERVAL_MS = 700;
/** Slower re-check once framed — abort if the face leaves, without slowing unlock. */
const READY_RECHECK_MS = 1200;
const RETRY_MS = 450;

export type LivePreviewQuality = {
  issue: LiveScanIssue | null;
  ready: boolean;
  loading: boolean;
};

/**
 * Live framing/lighting tips. Keeps re-checking after ready so countdown/capture
 * can abort if the face leaves the oval — we never want to shoot a bad frame.
 */
export function useLivePreviewQuality(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  active: boolean,
  /** Bump after a failed capture so framing must pass again (avoids instant re-fire). */
  resetToken = 0,
): LivePreviewQuality {
  const [state, setState] = useState<HysteresisState>(initialHysteresisState);
  const runningRef = useRef(false);
  const hystRef = useRef<HysteresisState>(initialHysteresisState());

  useEffect(() => {
    if (resetToken <= 0) return;
    const reset = initialHysteresisState();
    hystRef.current = reset;
    setState(reset);
  }, [resetToken]);

  useEffect(() => {
    if (!active) {
      return;
    }
    return runLiveSampling(cameraRef, runningRef, hystRef, setState);
  }, [active, cameraRef, resetToken]);

  return { issue: state.issue, ready: state.ready, loading: state.loading };
}

function runLiveSampling(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  runningRef: { current: boolean },
  hystRef: { current: HysteresisState },
  setState: (s: HysteresisState) => void,
): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;

  void getFaceDetector().then((detector) => {
    if (cancelled || detector) return;
    apply(hystRef, setState, false, 'detector_unavailable');
  });

  const schedule = (ms: number) => {
    timer = setTimeout(() => void tick(), ms);
  };

  const tick = async (): Promise<void> => {
    if (cancelled) return;
    if (runningRef.current) {
      schedule(RETRY_MS);
      return;
    }
    runningRef.current = true;
    try {
      const uri = await cameraRef.current?.sampleFrameUri();
      if (cancelled) return;
      if (!uri) {
        schedule(RETRY_MS);
        return;
      }
      const result = await assessLiveScanFrame(uri);
      if (cancelled) return;
      applyAssessment(hystRef, setState, result);
      // Keep monitoring after ready so a bad face aborts countdown/capture.
      schedule(hystRef.current.ready ? READY_RECHECK_MS : INTERVAL_MS);
    } catch {
      if (!cancelled) {
        apply(hystRef, setState, false, 'detector_unavailable');
        schedule(INTERVAL_MS);
      }
    } finally {
      runningRef.current = false;
    }
  };

  schedule(WARMUP_MS);
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

function applyAssessment(
  hystRef: { current: HysteresisState },
  setState: (s: HysteresisState) => void,
  result: LiveScanAssessment,
): void {
  apply(hystRef, setState, result.ok, result.ok ? null : result.issue);
}

function apply(
  hystRef: { current: HysteresisState },
  setState: (s: HysteresisState) => void,
  ok: boolean,
  issue: LiveScanIssue | null,
): void {
  const next = nextHysteresis(hystRef.current, ok, issue);
  hystRef.current = next;
  setState(next);
}
