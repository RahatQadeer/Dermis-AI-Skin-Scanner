import { useCallback } from 'react';

import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import { deleteRoutineStep, setRoutineCompletion } from '../api/routineApi';
import { countDone } from '../lib/routineLogic';
import { isPersistedStepId } from '../lib/routineStepIds';
import type { RoutinePeriod, RoutineState } from '../types/routineTypes';
import { mutateRemoveStep, mutateToggle } from './routineMutations';
import type { useRoutineToast } from './useRoutineToast';

type ToastApi = ReturnType<typeof useRoutineToast>;

export function useRoutineStepActions(opts: {
  live: boolean;
  stateRef: { current: RoutineState };
  periodRef: { current: RoutinePeriod };
  setState: (s: RoutineState) => void;
  toast: ToastApi;
  showComplete: (period: RoutinePeriod) => void;
  toastForKey: (key: 'done' | 'undone') => string;
}) {
  const onToggle = useCallback(
    (stepId: string) => {
      const previous = opts.stateRef.current;
      const currentPeriod = opts.periodRef.current;
      const result = mutateToggle(previous, currentPeriod, stepId);
      if (!result.ok) {
        return;
      }
      opts.setState(result.state);
      notifyToggleResult({ result, currentPeriod, stepId, previous, opts });
    },
    [opts],
  );

  const onRemove = useCallback(
    (stepId: string) => {
      const previous = opts.stateRef.current;
      const currentPeriod = opts.periodRef.current;
      const result = mutateRemoveStep(previous, currentPeriod, stepId);
      if (!result.ok) {
        return;
      }
      opts.setState(result.state);
      opts.toast.showToast(getCopy().screens.routine.toastStepRemoved);
      if (!opts.live || !isPersistedStepId(stepId)) {
        return;
      }
      void deleteRoutineStep(stepId).catch((error: unknown) => {
        if (isApiError(error) && error.status === 404) {
          return;
        }
        opts.setState(previous);
        opts.toast.showToast(getCopy().screens.routine.saveError);
      });
    },
    [opts],
  );

  return { onToggle, onRemove };
}

function notifyToggleResult(ctx: {
  result: Extract<ReturnType<typeof mutateToggle>, { ok: true }>;
  currentPeriod: RoutinePeriod;
  stepId: string;
  previous: RoutineState;
  opts: {
    live: boolean;
    setState: (s: RoutineState) => void;
    toast: ToastApi;
    showComplete: (period: RoutinePeriod) => void;
    toastForKey: (key: 'done' | 'undone') => string;
  };
}): void {
  const periodSteps = ctx.result.state[ctx.currentPeriod];
  const allDone =
    ctx.result.toastKey === 'done' &&
    periodSteps.length > 0 &&
    countDone(periodSteps) === periodSteps.length;
  if (allDone) {
    ctx.opts.showComplete(ctx.currentPeriod);
  } else if (ctx.result.toastKey === 'done' || ctx.result.toastKey === 'undone') {
    ctx.opts.toast.showToast(ctx.opts.toastForKey(ctx.result.toastKey));
  }
  if (!ctx.opts.live || !isPersistedStepId(ctx.stepId)) {
    return;
  }
  const done = periodSteps.find((s) => s.id === ctx.stepId)?.done ?? false;
  void setRoutineCompletion(ctx.stepId, done, new Date().toISOString().slice(0, 10)).catch(() => {
    ctx.opts.setState(ctx.previous);
    ctx.opts.toast.showToast(getCopy().screens.routine.saveError);
  });
}
