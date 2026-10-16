import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import {
  addRoutineStepSchema,
  completionSchema,
  patchRoutineStepSchema,
  replaceRoutineSchema,
} from '../schemas/routineApi';
import {
  createRoutineService,
  utcDateString,
  type RoutineService,
} from '../services/routineService';

export async function handleGetRoutine(
  service: RoutineService,
  userId: string,
  dateParam: string | null,
): Promise<Response> {
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : utcDateString();
  const routine = await service.getRoutine(userId, date);
  return json({ routine });
}

export async function handleReplaceRoutine(
  service: RoutineService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = replaceRoutineSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const routine = await service.replaceRoutine(userId, parsed.data, utcDateString());
  return json({ routine });
}

export async function handleAddRoutineStep(
  service: RoutineService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = addRoutineStepSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const step = await service.addStep(userId, parsed.data.period, parsed.data.label);
  return json({ step }, 201);
}

export async function handlePatchRoutineStep(
  service: RoutineService,
  userId: string,
  stepId: string,
  body: unknown,
): Promise<Response> {
  const parsed = patchRoutineStepSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const step = await service.updateStep(userId, stepId, parsed.data.label);
  return json({ step });
}

export async function handleDeleteRoutineStep(
  service: RoutineService,
  userId: string,
  stepId: string,
): Promise<Response> {
  await service.deleteStep(userId, stepId);
  return json({ ok: true });
}

export async function handleRoutineCompletion(
  service: RoutineService,
  userId: string,
  stepId: string,
  body: unknown,
): Promise<Response> {
  const parsed = completionSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const date = parsed.data.date ?? utcDateString();
  const step = await service.setCompletion(userId, stepId, parsed.data.done, date);
  return json({ step, date });
}

export { createRoutineService };
