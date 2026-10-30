import { useEffect, useRef, useState, type RefObject } from 'react';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { assessLiveScanFrame } from '../lib/assessLiveScanFrame';
import { getFaceDetector } from '../lib/faceDetectorSingleton';
import type { LiveScanIssue } from '../lib/liveScanGuidance';
import {
  initialHysteresisState,
  nextHysteresis,
  type HysteresisState,
} from './livePreviewHysteresis';

const WARMUP_MS = 80;
const INTERVAL_MS = 450;
const RETRY_MS = 180;

export type LivePreviewQuality = {
  issue: LiveScanIssue | null;
  ready: boolean;
  loading: boolean;
};

/** Live MediaPipe face framing + lighting/blur; tip updates every successful sample. */
export function useLivePreviewQuality(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  active: boolean,
): LivePreviewQuality {
  const [state, setState] = useState<HysteresisState>(initialHysteresisState);
  const runningRef = useRef(false);
  const hystRef = useRef<HysteresisState>(initialHysteresisState());

  useEffect(() => {
    if (!active) {
      const reset = initialHysteresisState();
      hystRef.current = reset;
      setState(reset);
      return;
    }
    return runLiveSampling(cameraRef, runningRef, hystRef, setState);
  }, [active, cameraRef]);

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
        // Camera busy — retry soon; do not freeze the last tip forever.
        schedule(RETRY_MS);
        return;
      }
      const result = await assessLiveScanFrame(uri);
      if (cancelled) return;
      apply(hystRef, setState, result.ok, result.ok ? null : result.issue);
      schedule(INTERVAL_MS);
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
