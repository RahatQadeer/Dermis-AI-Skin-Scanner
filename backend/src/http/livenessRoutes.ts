import { requireUser } from '../auth/requireUser';
import {
  handleCompleteLivenessChallenge,
  handleIssueLivenessChallenge,
} from '../handlers/livenessHandlers';
import type { AppDeps } from './createApp';
import { json } from './respond';

export async function handleLivenessRoute(
  request: Request,
  method: string,
  path: string,
  deps: AppDeps,
): Promise<Response> {
  if (!deps.livenessFor) {
    return json({ error: 'liveness_not_configured' }, 503);
  }
  const { user } = await requireUser(request, deps.auth);
  const liveness = deps.livenessFor({ userId: user.id });

  if (method === 'POST' && path === '/v1/face-liveness/challenge') {
    const body = await request.json().catch(() => ({}));
    return handleIssueLivenessChallenge(liveness, user.id, body);
  }
  if (method === 'POST' && path === '/v1/face-liveness/complete') {
    return handleCompleteLivenessChallenge(liveness, user.id, await request.json());
  }
  return json({ error: 'method_not_allowed' }, 405);
}
