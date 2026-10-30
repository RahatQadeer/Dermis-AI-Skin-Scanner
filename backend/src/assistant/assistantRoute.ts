import { requireUser } from '../auth/requireUser';
import type { AppDeps } from '../http/createApp';
import { readJsonBody } from '../http/readJsonBody';
import { json } from '../http/respond';
import { handleAssistantMessage } from './assistantHandler';

export const ASSISTANT_PATH = '/v1/assistant/messages';

export async function handleAssistantRoute(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.assistantFor) {
    return json({ error: 'assistant_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const service = deps.assistantFor({ userId: user.id, accessToken });
  return handleAssistantMessage(service, user.id, await readJsonBody(request));
}
