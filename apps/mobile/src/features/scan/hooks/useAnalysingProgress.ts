import { useEffect, useRef, useState, type MutableRefObject } from 'react';

import { useReduceMotion } from '@/src/lib/useReduceMotion';

import {
  progressAfterTick,
  stepIndexForProgress,
  waitingProgressAfterTick,
} from '../lib/analysingProgress';

const TICK_MS = 320;
const TICK_STEP = 8;

export function useAnalysingProgress(
  stepCount: number,
  onComplete: () => void,
  autoComplete = true,
) {
  const reduceMotion = useReduceMotion();
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    doneRef.current = false;
    setProgress(0);
  }, [autoComplete]);

  useProgressTimer({ autoComplete, reduceMotion, setProgress, doneRef, onCompleteRef });

  const completeNow = () => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    setProgress(100);
    // Defer navigation — never call router during the render/setState phase.
    queueMicrotask(() => {
      onCompleteRef.current();
    });
  };

  return {
    progress,
    activeStep: stepIndexForProgress(progress, stepCount),
    completeNow,
  };
}

type ProgressTimerOpts = {
  autoComplete: boolean;
  reduceMotion: boolean;
  setProgress: (fn: (prev: number) => number) => void;
  doneRef: MutableRefObject<boolean>;
  onCompleteRef: MutableRefObject<() => void>;
};

function useProgressTimer(opts: ProgressTimerOpts): void {
  const { autoComplete, reduceMotion, setProgress, doneRef, onCompleteRef } = opts;
  useEffect(() => {
    if (reduceMotion && autoComplete) {
      setProgress(() => 100);
      if (!doneRef.current) {
        doneRef.current = true;
        queueMicrotask(() => {
          onCompleteRef.current();
        });
      }
      return;
    }

    const timer = setInterval(() => {
      let reachedEnd = false;
      setProgress((prev) => {
        if (doneRef.current) {
          return 100;
        }
        if (!autoComplete) {
          return waitingProgressAfterTick(prev);
        }
        const next = Math.min(progressAfterTick(prev, TICK_STEP), 100);
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true;
          reachedEnd = true;
        }
        return next;
      });
      if (reachedEnd) {
        clearInterval(timer);
        queueMicrotask(() => {
          onCompleteRef.current();
        });
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [autoComplete, doneRef, onCompleteRef, reduceMotion, setProgress]);
}
