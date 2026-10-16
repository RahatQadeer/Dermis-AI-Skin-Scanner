import {
  addStep,
  findStepByLabel,
  removeStep,
  replacePeriodSteps,
  toggleStep,
  updateStepLabel,
} from '../lib/routineLogic';
import type { RoutinePeriod, RoutineState } from '../types/routineTypes';
import type { RoutineSheetMode } from './routineSheetTypes';

export type MutationResult =
  | {
      ok: true;
      state: RoutineState;
      toastKey: 'done' | 'undone' | 'added' | 'updated' | 'removed';
    }
  | { ok: false; labelError: true };

export function mutateToggle(
  state: RoutineState,
  period: RoutinePeriod,
  stepId: string,
): MutationResult {
  const current = state[period];
  const next = toggleStep(current, stepId);
  const toggled = next.find((s) => s.id === stepId);
  return {
    ok: true,
    state: replacePeriodSteps(state, period, next),
    toastKey: toggled?.done ? 'done' : 'undone',
  };
}

export type SaveSheetInput = {
  state: RoutineState;
  period: RoutinePeriod;
  sheet: RoutineSheetMode;
  draftLabel: string;
  nextCustomId: string;
};

export function mutateSaveSheet(input: SaveSheetInput): MutationResult {
  const { state, period, sheet, draftLabel, nextCustomId } = input;
  if (sheet.kind === 'closed') {
    return { ok: false, labelError: true };
  }
  const current = state[period];
  if (sheet.kind === 'add') {
    const result = addStep(current, nextCustomId, draftLabel);
    if (!result) {
      return { ok: false, labelError: true };
    }
    return {
      ok: true,
      state: replacePeriodSteps(state, period, result.steps),
      toastKey: 'added',
    };
  }
  const updated = updateStepLabel(current, sheet.stepId, draftLabel);
  if (!updated) {
    return { ok: false, labelError: true };
  }
  return {
    ok: true,
    state: replacePeriodSteps(state, period, updated),
    toastKey: 'updated',
  };
}

export function mutateRemoveStep(
  state: RoutineState,
  period: RoutinePeriod,
  stepId: string,
): MutationResult {
  const current = state[period];
  if (!current.some((step) => step.id === stepId)) {
    return { ok: false, labelError: true };
  }
  return {
    ok: true,
    state: replacePeriodSteps(state, period, removeStep(current, stepId)),
    toastKey: 'removed',
  };
}

export function mutateToggleSuggestion(
  state: RoutineState,
  period: RoutinePeriod,
  label: string,
  nextId: string,
): MutationResult {
  const current = state[period];
  const existing = findStepByLabel(current, label);
  if (existing) {
    return {
      ok: true,
      state: replacePeriodSteps(state, period, removeStep(current, existing.id)),
      toastKey: 'removed',
    };
  }
  const result = addStep(current, nextId, label);
  if (!result) {
    return { ok: false, labelError: true };
  }
  return {
    ok: true,
    state: replacePeriodSteps(state, period, result.steps),
    toastKey: 'added',
  };
}
