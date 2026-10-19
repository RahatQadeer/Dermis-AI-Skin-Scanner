import { useEffect, useRef } from 'react';

/** Hold green framing this long, then auto-take (YouCam-style). */
const AUTO_CAPTURE_HOLD_MS = 550;

/** Auto-click the shutter once the frame stays ready; cancel if framing drops. */
export function useAutoCaptureWhenReady(opts: {
  ready: boolean;
  busy: boolean;
  countdownActive: boolean;
  startCountdown: () => void;
  cancelCountdown: () => void;
}): void {
  const { ready, busy, countdownActive, startCountdown, cancelCountdown } = opts;
  const startRef = useRef(startCountdown);
  const cancelRef = useRef(cancelCountdown);
  startRef.current = startCountdown;
  cancelRef.current = cancelCountdown;
  const firedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ready && countdownActive) {
      cancelRef.current();
    }
  }, [ready, countdownActive]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!ready) {
      firedRef.current = false;
      return;
    }

    // Already counting / capturing — wait; re-arm after busy clears if still framed.
    if (busy) {
      return;
    }

    if (firedRef.current) {
      // Finished a shot while still green — require leaving ready before next auto.
      return;
    }

    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      startRef.current();
    }, AUTO_CAPTURE_HOLD_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [ready, busy]);
}
