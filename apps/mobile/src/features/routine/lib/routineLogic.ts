import type { RoutinePeriod, RoutineState, RoutineStep } from '../types/routineTypes';

const MAX_LABEL_LENGTH = 80;

export function normalizeStepLabel(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_LABEL_LENGTH) {
    return null;
  }
  return trimmed;
}

export function countDone(steps: readonly RoutineStep[]): number {
  return steps.filter((step) => step.done).length;
}

export function toggleStep(steps: RoutineStep[], stepId: string): RoutineStep[] {
  return steps.map((step) => (step.id === stepId ? { ...step, done: !step.done } : step));
}

export function updateStepLabel(
  steps: RoutineStep[],
  stepId: string,
  label: string,
): RoutineStep[] | null {
  const normalized = normalizeStepLabel(label);
  if (!normalized) {
    return null;
  }
  return steps.map((step) => (step.id === stepId ? { ...step, label: normalized } : step));
}

export function addStep(
  steps: RoutineStep[],
  id: string,
  label: string,
): { steps: RoutineStep[] } | null {
  const normalized = normalizeStepLabel(label);
  if (!normalized) {
    return null;
  }
  if (findStepByLabel(steps, normalized)) {
    return null;
  }
  return { steps: [...steps, { id, label: normalized, done: false }] };
}

export function findStepByLabel(
  steps: readonly RoutineStep[],
  label: string,
): RoutineStep | undefined {
  const key = label.trim().toLowerCase();
  if (!key) {
    return undefined;
  }
  return steps.find((step) => step.label.trim().toLowerCase() === key);
}

export function removeStep(steps: RoutineStep[], stepId: string): RoutineStep[] {
  return steps.filter((step) => step.id !== stepId);
}

export function replacePeriodSteps(
  state: RoutineState,
  period: RoutinePeriod,
  steps: RoutineStep[],
): RoutineState {
  return { ...state, [period]: steps };
}
