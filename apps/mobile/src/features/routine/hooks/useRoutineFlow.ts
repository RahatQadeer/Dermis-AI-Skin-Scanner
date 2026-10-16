import { getCopy } from '@/src/copy';

import type { RoutinePeriod, RoutineState } from '../types/routineTypes';
import { useRoutineFlowCore } from './useRoutineFlowCore';
import {
  useRoutineCompleteBanner,
  useRoutineDoneSparkle,
  useRoutineSheetHandlers,
} from './useRoutineSheetHandlers';
import { useRoutineStepActions } from './useRoutineStepActions';

function toastForKey(key: 'done' | 'undone'): string {
  const r = getCopy().screens.routine;
  return key === 'done' ? r.toastStepDone : r.toastStepUndone;
}

function completeMessageForPeriod(period: RoutinePeriod): string {
  const r = getCopy().screens.routine;
  return period === 'am' ? r.toastRoutineCompleteAm : r.toastRoutineCompletePm;
}

export function useRoutineFlow(initial: RoutineState) {
  const core = useRoutineFlowCore(initial);
  const banner = useRoutineCompleteBanner();
  const sparkle = useRoutineDoneSparkle(core.sheetDraft.closeSheet);

  const { onToggle, onRemove } = useRoutineStepActions({
    live: core.live,
    stateRef: core.stateRef,
    periodRef: core.periodRef,
    setState: core.setState,
    toast: core.toast,
    showComplete: (p) => banner.showComplete(completeMessageForPeriod(p)),
    toastForKey,
  });

  const sheetHandlers = useRoutineSheetHandlers({
    live: core.live,
    stateRef: core.stateRef,
    periodRef: core.periodRef,
    steps: core.steps,
    setState: core.setState,
    sheetDraft: core.sheetDraft,
    toast: core.toast,
  });

  return {
    loading: core.loading,
    period: core.period,
    setPeriod: core.setPeriod,
    steps: core.steps,
    doneCount: core.doneCount,
    ...core.sheetDraft,
    onToggle,
    onRemove,
    ...sheetHandlers,
    onDoneSheet: () => sparkle.onDoneSheet(core.sheetDraft.sheet.kind),
    doneSparkle: sparkle.doneSparkle,
    toastMessage: core.toast.toastMessage,
    toastVisible: core.toast.toastVisible && !banner.completeVisible,
    dismissToast: core.toast.dismissToast,
    completeVisible: banner.completeVisible,
    completeMessage: banner.completeMessage,
    dismissComplete: banner.dismissComplete,
  };
}
