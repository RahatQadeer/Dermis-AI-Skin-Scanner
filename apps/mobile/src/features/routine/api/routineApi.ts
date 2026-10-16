import { getApiClient } from '@/src/lib/api/client';

import type { RoutinePeriod, RoutineState, RoutineStep } from '../types/routineTypes';

type ApiStep = {
  id: string;
  period: RoutinePeriod;
  label: string;
  done: boolean;
};

type RoutineBundle = {
  am: ApiStep[];
  pm: ApiStep[];
  date: string;
};

export async function fetchRoutine(): Promise<{ state: RoutineState; date: string }> {
  const res = await getApiClient().get<{ routine: RoutineBundle }>('/v1/routine');
  return bundleToResult(res.routine);
}

/** Replace AM/PM labels (used to seed defaults when the server routine is empty). */
export async function replaceRoutine(labels: {
  am: string[];
  pm: string[];
}): Promise<{ state: RoutineState; date: string }> {
  const res = await getApiClient().put<{ routine: RoutineBundle }>('/v1/routine', labels);
  return bundleToResult(res.routine);
}

export async function addRoutineStep(period: RoutinePeriod, label: string): Promise<RoutineStep> {
  const res = await getApiClient().post<{ step: ApiStep }>('/v1/routine/steps', {
    period,
    label,
  });
  return toStep(res.step);
}

export async function patchRoutineStep(stepId: string, label: string): Promise<RoutineStep> {
  const res = await getApiClient().patch<{ step: ApiStep }>(`/v1/routine/steps/${stepId}`, {
    label,
  });
  return toStep(res.step);
}

export async function deleteRoutineStep(stepId: string): Promise<void> {
  await getApiClient().delete(`/v1/routine/steps/${stepId}`);
}

export async function setRoutineCompletion(
  stepId: string,
  done: boolean,
  completedOn: string,
): Promise<RoutineStep> {
  const res = await getApiClient().put<{ step: ApiStep }>(
    `/v1/routine/steps/${stepId}/completion`,
    { done, date: completedOn },
  );
  return toStep(res.step);
}

function bundleToResult(routine: RoutineBundle): { state: RoutineState; date: string } {
  return {
    date: routine.date,
    state: {
      am: routine.am.map(toStep),
      pm: routine.pm.map(toStep),
    },
  };
}

function toStep(step: ApiStep): RoutineStep {
  return { id: step.id, label: step.label, done: step.done };
}
