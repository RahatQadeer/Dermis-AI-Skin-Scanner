import { z } from 'zod';

import { normalizeRoutineLabel } from './routineLabel';
import type { RoutinePeriod, RoutineRepository, RoutineStepRecord } from './routineTypes';

export type SupabaseRoutineConfig = {
  supabaseUrl: string;
  anonKey: string;
  /** The user's JWT — RLS limits every query to their own rows. */
  accessToken: string;
  fetchImpl?: typeof fetch;
};

type Rest = {
  fetchImpl: typeof fetch;
  root: string;
  headers: (extra?: Record<string, string>) => HeadersInit;
};

const stepRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  period: z.enum(['am', 'pm']),
  sort_order: z.number().int(),
  label: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Routine steps + daily completions in Postgres (replaces the in-memory store). */
export function createSupabaseRoutineRepository(config: SupabaseRoutineConfig): RoutineRepository {
  const rest: Rest = {
    fetchImpl: config.fetchImpl ?? fetch,
    root: `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1`,
    headers: (extra = {}) => ({
      apikey: config.anonKey,
      authorization: `Bearer ${config.accessToken}`,
      'content-type': 'application/json',
      ...extra,
    }),
  };
  return {
    listSteps: (userId) =>
      selectSteps(rest, `user_id=eq.${enc(userId)}&order=period.asc,sort_order.asc`),
    addStep: (input) => addStep(rest, input),
    updateLabel: async (userId, stepId, label) => {
      const rows = await send(rest, 'PATCH', `routine_steps?${ownStep(userId, stepId)}`, {
        label: normalizeRoutineLabel(label),
        updated_at: new Date().toISOString(),
      });
      return rows[0] ? fromDb(rows[0]) : null;
    },
    deleteStep: async (userId, stepId) => {
      const rows = await send(rest, 'DELETE', `routine_steps?${ownStep(userId, stepId)}`);
      return rows.length > 0;
    },
    replacePeriod: (userId, period, labels) => replacePeriod(rest, userId, period, labels),
    setCompletion: (input) => setCompletion(rest, input),
    listCompletions: async (userId, completedOn) => {
      const rows = await send(
        rest,
        'GET',
        `routine_step_completions?user_id=eq.${enc(userId)}&completed_on=eq.${enc(completedOn)}&select=step_id`,
      );
      return new Set(rows.map((row) => String((row as { step_id: string }).step_id)));
    },
    deleteAllForUser: async (userId) => {
      // Completions cascade from steps.
      await send(rest, 'DELETE', `routine_steps?user_id=eq.${enc(userId)}`);
    },
  };
}

async function addStep(
  rest: Rest,
  input: { userId: string; period: RoutinePeriod; label: string },
): Promise<RoutineStepRecord> {
  const label = normalizeRoutineLabel(input.label);
  const last = await send(
    rest,
    'GET',
    `routine_steps?user_id=eq.${enc(input.userId)}&period=eq.${input.period}` +
      `&select=sort_order&order=sort_order.desc&limit=1`,
  );
  const nextSort = last[0] ? (last[0] as { sort_order: number }).sort_order + 1 : 0;
  const rows = await send(rest, 'POST', 'routine_steps', {
    user_id: input.userId,
    period: input.period,
    sort_order: nextSort,
    label,
  });
  return fromDb(rows[0]);
}

async function replacePeriod(
  rest: Rest,
  userId: string,
  period: RoutinePeriod,
  labels: string[],
): Promise<RoutineStepRecord[]> {
  const normalized = labels.map(normalizeRoutineLabel);
  await send(rest, 'DELETE', `routine_steps?user_id=eq.${enc(userId)}&period=eq.${period}`);
  if (normalized.length === 0) {
    return [];
  }
  const rows = await send(
    rest,
    'POST',
    'routine_steps',
    normalized.map((label, index) => ({ user_id: userId, period, sort_order: index, label })),
  );
  return rows.map(fromDb).sort((a, b) => a.sortOrder - b.sortOrder);
}

async function setCompletion(
  rest: Rest,
  input: { userId: string; stepId: string; completedOn: string; done: boolean },
): Promise<void> {
  if (input.done) {
    await send(rest, 'POST', 'routine_step_completions', {
      user_id: input.userId,
      step_id: input.stepId,
      completed_on: input.completedOn,
    });
    return;
  }
  await send(
    rest,
    'DELETE',
    `routine_step_completions?user_id=eq.${enc(input.userId)}` +
      `&step_id=eq.${enc(input.stepId)}&completed_on=eq.${enc(input.completedOn)}`,
  );
}

async function selectSteps(rest: Rest, query: string): Promise<RoutineStepRecord[]> {
  const rows = await send(rest, 'GET', `routine_steps?${query}&select=*`);
  return rows.map(fromDb);
}

async function send(
  rest: Rest,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<unknown[]> {
  // Completions are idempotent: re-ticking an already-done step is a no-op.
  const prefer =
    method === 'POST' && path === 'routine_step_completions'
      ? 'resolution=ignore-duplicates,return=representation'
      : 'return=representation';
  const response = await rest.fetchImpl(`${rest.root}/${path}`, {
    method,
    headers: rest.headers(method === 'GET' ? {} : { prefer }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`routine_${method.toLowerCase()}_failed`);
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as unknown[]) : [];
}

function ownStep(userId: string, stepId: string): string {
  return `id=eq.${enc(stepId)}&user_id=eq.${enc(userId)}`;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

function fromDb(raw: unknown): RoutineStepRecord {
  const row = stepRowSchema.parse(raw);
  return {
    id: row.id,
    userId: row.user_id,
    period: row.period,
    sortOrder: row.sort_order,
    label: row.label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
