import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import { addRoutineStep, deleteRoutineStep, patchRoutineStep } from '../api/routineApi';
import { findStepByLabel } from '../lib/routineLogic';
import { isPersistedStepId, localStepId } from '../lib/routineStepIds';
import type { RoutinePeriod, RoutineState, RoutineStep } from '../types/routineTypes';
import { mutateSaveSheet, mutateToggleSuggestion } from './routineMutations';
import type { RoutineSheetMode } from './routineSheetTypes';

function toastForKey(key: 'done' | 'undone' | 'added' | 'updated' | 'removed'): string {
  const r = getCopy().screens.routine;
  if (key === 'done') {
    return r.toastStepDone;
  }
  if (key === 'undone') {
    return r.toastStepUndone;
  }
  if (key === 'added') {
    return r.toastStepAdded;
  }
  if (key === 'removed') {
    return r.toastStepRemoved;
  }
  return r.toastStepUpdated;
}

export type PersistSheetCtx = {
  apiLive: boolean;
  period: RoutinePeriod;
  state: RoutineState;
  setState: (s: RoutineState) => void;
  sheet: RoutineSheetMode;
  draftLabel: string;
  setLabelError: (msg: string | undefined) => void;
  closeSheet: () => void;
  showToast: (msg: string) => void;
  /** When false, keep the sheet open after a successful add (suggestion / custom). */
  closeAfter?: boolean;
};

export async function persistRoutineSheet(ctx: PersistSheetCtx): Promise<void> {
  const result = mutateSaveSheet({
    state: ctx.state,
    period: ctx.period,
    sheet: ctx.sheet,
    draftLabel: ctx.draftLabel,
    nextCustomId: localStepId(ctx.period, ctx.draftLabel),
  });
  if (!result.ok) {
    ctx.setLabelError(getCopy().screens.routine.stepLabelError);
    return;
  }
  ctx.setState(result.state);
  if (ctx.closeAfter !== false) {
    ctx.showToast(toastForKey(result.toastKey));
    ctx.closeSheet();
  }

  if (!ctx.apiLive || ctx.sheet.kind === 'closed') {
    return;
  }
  await syncSheetToApi(ctx, result.state, result.toastKey);
}

export async function persistToggleSuggestion(ctx: {
  apiLive: boolean;
  period: RoutinePeriod;
  getState: () => RoutineState;
  setState: (s: RoutineState) => void;
  label: string;
  showToast: (msg: string) => void;
}): Promise<void> {
  const nextId = localStepId(ctx.period, ctx.label);
  const before = ctx.getState();
  const result = mutateToggleSuggestion(before, ctx.period, ctx.label, nextId);
  if (!result.ok) {
    return;
  }
  ctx.setState(result.state);
  ctx.showToast(toastForKey(result.toastKey));

  if (!ctx.apiLive) {
    return;
  }

  if (result.toastKey === 'removed') {
    const removed = findStepByLabel(before[ctx.period], ctx.label);
    if (!removed || !isPersistedStepId(removed.id)) {
      return;
    }
    try {
      await deleteRoutineStep(removed.id);
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        return;
      }
      ctx.setState(before);
      ctx.showToast(getCopy().screens.routine.saveError);
    }
    return;
  }

  try {
    const step = await addRoutineStep(ctx.period, ctx.label.trim());
    const latest = ctx.getState();
    ctx.setState({
      ...latest,
      [ctx.period]: replaceLocalWithServer(latest[ctx.period], ctx.label, step),
    });
  } catch {
    // Keep optimistic local step — add already visible in the sheet.
  }
}

async function syncSheetToApi(
  ctx: PersistSheetCtx,
  nextState: RoutineState,
  toastKey: 'done' | 'undone' | 'added' | 'updated' | 'removed',
): Promise<void> {
  const label = ctx.draftLabel.trim();
  try {
    if (ctx.sheet.kind === 'add' && toastKey === 'added') {
      const step = await addRoutineStep(ctx.period, label);
      ctx.setState({
        ...nextState,
        [ctx.period]: replaceLocalWithServer(nextState[ctx.period], label, step),
      });
      return;
    }
    if (ctx.sheet.kind === 'edit' && isPersistedStepId(ctx.sheet.stepId)) {
      const step = await patchRoutineStep(ctx.sheet.stepId, label);
      ctx.setState({
        ...nextState,
        [ctx.period]: nextState[ctx.period].map((s) => (s.id === step.id ? step : s)),
      });
    }
  } catch {
    // Optimistic UI already applied.
  }
}

/** Swap a temporary local id for the server step (same label). */
function replaceLocalWithServer(
  steps: RoutineStep[],
  label: string,
  serverStep: RoutineStep,
): RoutineStep[] {
  const key = label.trim().toLowerCase();
  let swapped = false;
  const next: RoutineStep[] = [];
  for (const step of steps) {
    if (!swapped && step.label.trim().toLowerCase() === key && !isPersistedStepId(step.id)) {
      next.push(serverStep);
      swapped = true;
      continue;
    }
    if (step.id === serverStep.id) {
      continue;
    }
    next.push(step);
  }
  if (!swapped && !findStepByLabel(next, serverStep.label)) {
    next.push(serverStep);
  }
  return next;
}
