import { useCallback, useEffect, useRef, useState } from 'react';

/** Single short beat once ready — keep the scan snappy. */
const COUNT_FROM = 1;
const TICK_MS = 350;

/**
 * Hold-still gate before auto-capture. Once started, callers must not cancel
 * on ready flicker — that caused the blink / timer restart loop.
 */
export function useCaptureCountdown(onFinished: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const active = secondsLeft !== null;

  const start = useCallback(() => {
    if (secondsLeft !== null) {
      return;
    }
    setSecondsLeft(COUNT_FROM);
  }, [secondsLeft]);

  const cancel = useCallback(() => {
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    if (secondsLeft === null) {
      return;
    }
    if (secondsLeft <= 0) {
      setSecondsLeft(null);
      onFinishedRef.current();
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => (prev === null ? null : prev - 1));
    }, TICK_MS);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return {
    secondsLeft,
    active,
    frameReady: active,
    start,
    cancel,
  };
}
