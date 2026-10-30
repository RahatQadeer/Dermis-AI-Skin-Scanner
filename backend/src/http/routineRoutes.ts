import {
  handleAddRoutineStep,
  handleDeleteRoutineStep,
  handleGetRoutine,
  handlePatchRoutineStep,
  handleReplaceRoutine,
  handleRoutineCompletion,
} from '../handlers/routineHandlers';
import { handleGetSettings, handlePatchSettings } from '../handlers/settingsHandlers';
import { json } from './respond';
import type { RoutineService } from '../services/routineService';
import type { SettingsService } from '../services/settingsService';
import { readJsonBody } from './readJsonBody';

export type RoutineSettingsDeps = {
  routine: RoutineService;
  settings: SettingsService;
};

type RouteCtx = {
  request: Request;
  method: string;
  path: string;
  userId: string;
  deps: RoutineSettingsDeps;
};

export async function routeRoutineAndSettings(ctx: RouteCtx): Promise<Response | null> {
  if (ctx.path === '/v1/settings') {
    return routeSettings(ctx);
  }
  if (ctx.path === '/v1/routine') {
    return routeRoutineRoot(ctx);
  }
  if (ctx.path === '/v1/routine/steps' && ctx.method === 'POST') {
    return handleAddRoutineStep(ctx.deps.routine, ctx.userId, await readJsonBody(ctx.request));
  }

  const stepMatch = /^\/v1\/routine\/steps\/([^/]+)$/.exec(ctx.path);
  if (stepMatch) {
    return routeRoutineStep(ctx, stepMatch[1]!);
  }

  const completionMatch = /^\/v1\/routine\/steps\/([^/]+)\/completion$/.exec(ctx.path);
  if (completionMatch && ctx.method === 'PUT') {
    return handleRoutineCompletion(
      ctx.deps.routine,
      ctx.userId,
      completionMatch[1]!,
      await readJsonBody(ctx.request),
    );
  }

  return null;
}

async function routeSettings(ctx: RouteCtx): Promise<Response> {
  if (ctx.method === 'GET') {
    return handleGetSettings(ctx.deps.settings, ctx.userId);
  }
  if (ctx.method === 'PATCH') {
    return handlePatchSettings(ctx.deps.settings, ctx.userId, await readJsonBody(ctx.request));
  }
  return json({ error: 'method_not_allowed' }, 405);
}

async function routeRoutineRoot(ctx: RouteCtx): Promise<Response> {
  if (ctx.method === 'GET') {
    const date = new URL(ctx.request.url).searchParams.get('date');
    return handleGetRoutine(ctx.deps.routine, ctx.userId, date);
  }
  if (ctx.method === 'PUT') {
    return handleReplaceRoutine(ctx.deps.routine, ctx.userId, await readJsonBody(ctx.request));
  }
  return json({ error: 'method_not_allowed' }, 405);
}

async function routeRoutineStep(ctx: RouteCtx, stepId: string): Promise<Response> {
  if (ctx.method === 'PATCH') {
    return handlePatchRoutineStep(
      ctx.deps.routine,
      ctx.userId,
      stepId,
      await readJsonBody(ctx.request),
    );
  }
  if (ctx.method === 'DELETE') {
    return handleDeleteRoutineStep(ctx.deps.routine, ctx.userId, stepId);
  }
  return json({ error: 'method_not_allowed' }, 405);
}
