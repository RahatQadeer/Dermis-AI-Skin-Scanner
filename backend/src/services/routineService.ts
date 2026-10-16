import { HttpError } from '../http/HttpError';
import type {
  RoutinePeriod,
  RoutineRepository,
  RoutineStepView,
} from '../repositories/routineTypes';

export type RoutineBundle = {
  am: RoutineStepView[];
  pm: RoutineStepView[];
  date: string;
};

export type RoutineService = {
  getRoutine: (userId: string, date: string) => Promise<RoutineBundle>;
  addStep: (userId: string, period: RoutinePeriod, label: string) => Promise<RoutineStepView>;
  updateStep: (userId: string, stepId: string, label: string) => Promise<RoutineStepView>;
  deleteStep: (userId: string, stepId: string) => Promise<void>;
  replaceRoutine: (
    userId: string,
    labels: { am: string[]; pm: string[] },
    date: string,
  ) => Promise<RoutineBundle>;
  setCompletion: (
    userId: string,
    stepId: string,
    done: boolean,
    date: string,
  ) => Promise<RoutineStepView>;
};

export function createRoutineService(repo: RoutineRepository): RoutineService {
  return {
    getRoutine: (userId, date) => loadView(repo, userId, date),
    addStep: (userId, period, label) => addStepSafe(repo, userId, period, label),
    updateStep: (userId, stepId, label) => updateStepSafe(repo, userId, stepId, label),
    deleteStep: async (userId, stepId) => {
      const ok = await repo.deleteStep(userId, stepId);
      if (!ok) {
        throw new HttpError(404, 'step_not_found');
      }
    },
    replaceRoutine: (userId, labels, date) => replaceSafe(repo, userId, labels, date),
    setCompletion: (userId, stepId, done, date) =>
      setCompletionSafe(repo, { userId, stepId, done, date }),
  };
}

async function addStepSafe(
  repo: RoutineRepository,
  userId: string,
  period: RoutinePeriod,
  label: string,
): Promise<RoutineStepView> {
  try {
    const row = await repo.addStep({ userId, period, label });
    return { ...row, done: false };
  } catch {
    throw new HttpError(400, 'invalid_label');
  }
}

async function updateStepSafe(
  repo: RoutineRepository,
  userId: string,
  stepId: string,
  label: string,
): Promise<RoutineStepView> {
  try {
    const row = await repo.updateLabel(userId, stepId, label);
    if (!row) {
      throw new HttpError(404, 'step_not_found');
    }
    return { ...row, done: false };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(400, 'invalid_label');
  }
}

async function replaceSafe(
  repo: RoutineRepository,
  userId: string,
  labels: { am: string[]; pm: string[] },
  date: string,
): Promise<RoutineBundle> {
  try {
    await repo.replacePeriod(userId, 'am', labels.am);
    await repo.replacePeriod(userId, 'pm', labels.pm);
  } catch {
    throw new HttpError(400, 'invalid_label');
  }
  return loadView(repo, userId, date);
}

async function setCompletionSafe(
  repo: RoutineRepository,
  input: { userId: string; stepId: string; done: boolean; date: string },
): Promise<RoutineStepView> {
  const steps = await repo.listSteps(input.userId);
  const step = steps.find((s) => s.id === input.stepId);
  if (!step) {
    throw new HttpError(404, 'step_not_found');
  }
  await repo.setCompletion({
    userId: input.userId,
    stepId: input.stepId,
    completedOn: input.date,
    done: input.done,
  });
  return { ...step, done: input.done };
}

async function loadView(
  repo: RoutineRepository,
  userId: string,
  date: string,
): Promise<RoutineBundle> {
  const [steps, doneIds] = await Promise.all([
    repo.listSteps(userId),
    repo.listCompletions(userId, date),
  ]);
  const am: RoutineStepView[] = [];
  const pm: RoutineStepView[] = [];
  for (const step of steps) {
    const view = { ...step, done: doneIds.has(step.id) };
    if (step.period === 'am') {
      am.push(view);
    } else {
      pm.push(view);
    }
  }
  return { am, pm, date };
}

export function utcDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
