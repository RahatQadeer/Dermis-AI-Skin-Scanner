import { useCallback, useEffect, useRef, useState } from 'react';

const COUNT_FROM = 3;
const TICK_MS = 700;

/**
 * 3–2–1 hold-still gate before capture. Native face ML is unavailable in Expo Go;
 * server Gemini still rejects unclear faces after the photo is taken.
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
