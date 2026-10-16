import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { fetchRoutine, replaceRoutine } from '../api/routineApi';
import type { RoutineState } from '../types/routineTypes';

const EMPTY_ROUTINE: RoutineState = { am: [], pm: [] };

async function loadRoutineFromServer(
  initial: RoutineState,
  seededRef: { current: boolean },
): Promise<RoutineState> {
  const result = await fetchRoutine();
  const empty = result.state.am.length === 0 && result.state.pm.length === 0;
  if (!empty) {
    seededRef.current = true;
    return result.state;
  }
  if (seededRef.current) {
    return result.state;
  }
  const seeded = await replaceRoutine({
    am: initial.am.map((step) => step.label),
    pm: initial.pm.map((step) => step.label),
  });
  seededRef.current = true;
  return seeded.state;
}

async function runRoutineLoad(
  showLoader: boolean,
  ctx: {
    apiLive: boolean;
    accessToken: string | null;
    initialRef: { current: RoutineState };
    seededRef: { current: boolean };
    setStateRef: { current: (s: RoutineState) => void };
    setLoadingRef: { current: (v: boolean) => void };
    readyRef: { current: boolean };
  },
): Promise<void> {
  if (!ctx.apiLive || !ctx.accessToken) {
    ctx.setStateRef.current(ctx.initialRef.current);
    ctx.setLoadingRef.current(false);
    ctx.readyRef.current = true;
    ctx.seededRef.current = false;
    return;
  }
  if (showLoader) {
    ctx.setLoadingRef.current(true);
    ctx.setStateRef.current(EMPTY_ROUTINE);
  }
  try {
    ctx.setStateRef.current(await loadRoutineFromServer(ctx.initialRef.current, ctx.seededRef));
    ctx.readyRef.current = true;
  } catch {
    ctx.setStateRef.current(ctx.initialRef.current);
    ctx.readyRef.current = true;
  } finally {
    ctx.setLoadingRef.current(false);
  }
}

export function useRoutineRemoteLoad(ctx: {
  apiLive: boolean;
  accessToken: string | null;
  initial: RoutineState;
  setState: (s: RoutineState) => void;
  setLoading: (v: boolean) => void;
  readyRef: { current: boolean };
}): void {
  const loadCtx = useRef({
    initialRef: { current: ctx.initial },
    seededRef: { current: false },
    setStateRef: { current: ctx.setState },
    setLoadingRef: { current: ctx.setLoading },
  });
  loadCtx.current.initialRef.current = ctx.initial;
  loadCtx.current.setStateRef.current = ctx.setState;
  loadCtx.current.setLoadingRef.current = ctx.setLoading;

  const runLoad = useCallback(
    (showLoader: boolean) =>
      runRoutineLoad(showLoader, {
        apiLive: ctx.apiLive,
        accessToken: ctx.accessToken,
        ...loadCtx.current,
        readyRef: ctx.readyRef,
      }),
    [ctx.accessToken, ctx.apiLive, ctx.readyRef],
  );

  useEffect(() => {
    void runLoad(true);
  }, [runLoad]);

  useFocusEffect(
    useCallback(() => {
      if (!ctx.apiLive || !ctx.accessToken || !ctx.readyRef.current) {
        return;
      }
      void runLoad(false);
    }, [ctx.accessToken, ctx.apiLive, ctx.readyRef, runLoad]),
  );
}
