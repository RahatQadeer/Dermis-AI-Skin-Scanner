import { randomUUID } from 'node:crypto';

import { normalizeRoutineLabel } from './routineLabel';
import type { RoutinePeriod, RoutineRepository, RoutineStepRecord } from './routineTypes';

export function createMemoryRoutineRepository(): RoutineRepository {
  const steps = new Map<string, RoutineStepRecord>();
  const completions = new Set<string>();
  return buildRepo(steps, completions);
}

function buildRepo(
  steps: Map<string, RoutineStepRecord>,
  completions: Set<string>,
): RoutineRepository {
  return {
    listSteps: async (userId) => listSteps(steps, userId),
    addStep: async (input) => addStep(steps, input),
    updateLabel: async (userId, stepId, label) => updateLabel(steps, userId, stepId, label),
    deleteStep: async (userId, stepId) => deleteStep(steps, completions, userId, stepId),
    replacePeriod: async (userId, period, labels) => replacePeriod(steps, userId, period, labels),
    setCompletion: async (input) => {
      const key = `${input.userId}:${input.stepId}:${input.completedOn}`;
      if (input.done) {
        completions.add(key);
      } else {
        completions.delete(key);
      }
    },
    listCompletions: async (userId, completedOn) =>
      listCompletions(completions, userId, completedOn),
    deleteAllForUser: async (userId) => {
      for (const row of [...steps.values()]) {
        if (row.userId === userId) {
          steps.delete(row.id);
        }
      }
      for (const key of [...completions]) {
        if (key.startsWith(`${userId}:`)) {
          completions.delete(key);
        }
      }
    },
  };
}

async function listSteps(
  steps: Map<string, RoutineStepRecord>,
  userId: string,
): Promise<RoutineStepRecord[]> {
  return [...steps.values()]
    .filter((s) => s.userId === userId)
    .sort((a, b) => a.period.localeCompare(b.period) || a.sortOrder - b.sortOrder)
    .map((s) => structuredClone(s));
}

async function addStep(
  steps: Map<string, RoutineStepRecord>,
  input: { userId: string; period: RoutinePeriod; label: string },
): Promise<RoutineStepRecord> {
  const now = new Date().toISOString();
  const row: RoutineStepRecord = {
    id: randomUUID(),
    userId: input.userId,
    period: input.period,
    sortOrder: nextSort(steps, input.userId, input.period),
    label: normalizeRoutineLabel(input.label),
    createdAt: now,
    updatedAt: now,
  };
  steps.set(row.id, row);
  return structuredClone(row);
}

async function updateLabel(
  steps: Map<string, RoutineStepRecord>,
  userId: string,
  stepId: string,
  label: string,
): Promise<RoutineStepRecord | null> {
  const row = steps.get(stepId);
  if (!row || row.userId !== userId) {
    return null;
  }
  row.label = normalizeRoutineLabel(label);
  row.updatedAt = new Date().toISOString();
  steps.set(stepId, row);
  return structuredClone(row);
}

async function deleteStep(
  steps: Map<string, RoutineStepRecord>,
  completions: Set<string>,
  userId: string,
  stepId: string,
): Promise<boolean> {
  const row = steps.get(stepId);
  if (!row || row.userId !== userId) {
    return false;
  }
  steps.delete(stepId);
  for (const key of [...completions]) {
    if (key.startsWith(`${userId}:${stepId}:`)) {
      completions.delete(key);
    }
  }
  return true;
}

async function replacePeriod(
  steps: Map<string, RoutineStepRecord>,
  userId: string,
  period: RoutinePeriod,
  labels: string[],
): Promise<RoutineStepRecord[]> {
  for (const row of [...steps.values()]) {
    if (row.userId === userId && row.period === period) {
      steps.delete(row.id);
    }
  }
  const created: RoutineStepRecord[] = [];
  for (const [index, raw] of labels.entries()) {
    const now = new Date().toISOString();
    const row: RoutineStepRecord = {
      id: randomUUID(),
      userId,
      period,
      sortOrder: index,
      label: normalizeRoutineLabel(raw),
      createdAt: now,
      updatedAt: now,
    };
    steps.set(row.id, row);
    created.push(structuredClone(row));
  }
  return created;
}

async function listCompletions(
  completions: Set<string>,
  userId: string,
  completedOn: string,
): Promise<ReadonlySet<string>> {
  const ids = new Set<string>();
  for (const key of completions) {
    const [uid, stepId, day] = key.split(':');
    if (uid === userId && day === completedOn && stepId) {
      ids.add(stepId);
    }
  }
  return ids;
}

function nextSort(
  steps: Map<string, RoutineStepRecord>,
  userId: string,
  period: RoutinePeriod,
): number {
  let max = -1;
  for (const row of steps.values()) {
    if (row.userId === userId && row.period === period) {
      max = Math.max(max, row.sortOrder);
    }
  }
  return max + 1;
}
