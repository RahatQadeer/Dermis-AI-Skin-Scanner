import { useCallback, useEffect, useRef, useState } from 'react';

import { findStepByLabel } from '../lib/routineLogic';
import type { RoutinePeriod, RoutineState } from '../types/routineTypes';
import { persistRoutineSheet, persistToggleSuggestion } from './persistRoutineSheet';
import type { useRoutineSheetDraft } from './useRoutineSheetDraft';
import type { useRoutineToast } from './useRoutineToast';

type SheetDraft = ReturnType<typeof useRoutineSheetDraft>;
type ToastApi = ReturnType<typeof useRoutineToast>;

export function useRoutineCompleteBanner() {
  const [completeVisible, setCompleteVisible] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');
  return {
    completeVisible,
    completeMessage,
    showComplete: useCallback((message: string) => {
      setCompleteMessage(message);
      setCompleteVisible(true);
    }, []),
    dismissComplete: useCallback(() => setCompleteVisible(false), []),
  };
}

export function useRoutineDoneSparkle(closeSheet: () => void) {
  const [doneSparkle, setDoneSparkle] = useState(false);
  const doneSparkleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (doneSparkleTimer.current) {
        clearTimeout(doneSparkleTimer.current);
      }
    },
    [],
  );

  const onDoneSheet = useCallback(
    (sheetKind: SheetDraft['sheet']['kind']) => {
      if (sheetKind !== 'add') {
        closeSheet();
        return;
      }
      if (doneSparkle) {
        return;
      }
      setDoneSparkle(true);
      if (doneSparkleTimer.current) {
        clearTimeout(doneSparkleTimer.current);
      }
      doneSparkleTimer.current = setTimeout(() => {
        setDoneSparkle(false);
        closeSheet();
        doneSparkleTimer.current = null;
      }, 2000);
    },
    [closeSheet, doneSparkle],
  );

  return { doneSparkle, onDoneSheet };
}

export function useRoutineSheetHandlers(opts: {
  live: boolean;
  stateRef: { current: RoutineState };
  periodRef: { current: RoutinePeriod };
  steps: RoutineState[RoutinePeriod];
  setState: (s: RoutineState) => void;
  sheetDraft: SheetDraft;
  toast: ToastApi;
}) {
  const persistSheet = useCallback(
    (draftLabel: string, closeAfter: boolean) => {
      void persistRoutineSheet({
        apiLive: opts.live,
        period: opts.periodRef.current,
        state: opts.stateRef.current,
        setState: opts.setState,
        sheet: opts.sheetDraft.sheet,
        draftLabel,
        setLabelError: opts.sheetDraft.setLabelError,
        closeSheet: opts.sheetDraft.closeSheet,
        showToast: opts.toast.showToast,
        closeAfter,
      });
    },
    [opts],
  );

  const onSaveSheet = useCallback(() => {
    persistSheet(opts.sheetDraft.draftLabel, opts.sheetDraft.sheet.kind !== 'add');
    if (opts.sheetDraft.sheet.kind === 'add') {
      opts.sheetDraft.setDraftLabel('');
    }
  }, [opts, persistSheet]);

  const onToggleSuggestion = useCallback((label: string) => {
    void persistToggleSuggestion({
      apiLive: opts.live,
      period: opts.periodRef.current,
      getState: () => opts.stateRef.current,
      setState: opts.setState,
      label,
      showToast: opts.toast.showToast,
    });
  }, [opts]);

  const isSuggestionAdded = useCallback(
    (label: string) => Boolean(findStepByLabel(opts.steps, label)),
    [opts.steps],
  );

  return { onSaveSheet, onToggleSuggestion, isSuggestionAdded };
}
