import { useMemo, useRef, useState } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { countDone } from '../lib/routineLogic';
import type { RoutinePeriod, RoutineState } from '../types/routineTypes';
import { useRoutineRemoteLoad } from './useRoutineRemoteLoad';
import { useRoutineSheetDraft } from './useRoutineSheetDraft';
import { useRoutineToast } from './useRoutineToast';

const EMPTY_ROUTINE: RoutineState = { am: [], pm: [] };

export function useRoutineFlowCore(initial: RoutineState) {
  const session = useSession();
  const live = session.apiEnabled && Boolean(session.accessToken);
  const [state, setState] = useState<RoutineState>(() => (live ? EMPTY_ROUTINE : initial));
  const [loading, setLoading] = useState(live);
  const [period, setPeriod] = useState<RoutinePeriod>('am');
  const sheetDraft = useRoutineSheetDraft();
  const toast = useRoutineToast();
  const stateRef = useRef(state);
  stateRef.current = state;
  const periodRef = useRef(period);
  periodRef.current = period;
  const readyRef = useRef(!live);

  useRoutineRemoteLoad({
    apiLive: live,
    accessToken: session.accessToken,
    initial,
    setState,
    setLoading,
    readyRef,
  });

  const steps = state[period];
  const doneCount = useMemo(() => countDone(steps), [steps]);

  return {
    live,
    state,
    setState,
    loading,
    period,
    setPeriod,
    steps,
    doneCount,
    sheetDraft,
    toast,
    stateRef,
    periodRef,
  };
}
