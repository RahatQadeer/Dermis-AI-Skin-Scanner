import { useEffect, useRef } from 'react';

import { decideAutoCapture } from './autoCaptureWhenReady';

/** Starts a one-shot countdown the first time framing becomes ready. */
export function useAutoCaptureWhenReady(opts: {
  ready: boolean;
  capturing: boolean;
  countdownActive: boolean;
  startCountdown: () => void;
}): void {
  const didAutoRef = useRef(false);
  const { ready, capturing, countdownActive, startCountdown } = opts;

  useEffect(() => {
    const decision = decideAutoCapture({
      ready,
      capturing,
      countdownActive,
      didAuto: didAutoRef.current,
    });
    if (decision === 'reset_latch') {
      didAutoRef.current = false;
      return;
    }
    if (decision === 'start') {
      didAutoRef.current = true;
      startCountdown();
    }
  }, [ready, capturing, countdownActive, startCountdown]);
}
