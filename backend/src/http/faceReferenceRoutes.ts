import { requireUser } from '../auth/requireUser';
import {
  handleGetFaceReference,
  handleRegisterFaceReference,
} from '../handlers/faceReferenceHandlers';
import type { AppDeps } from './createApp';
import { json } from './respond';

export async function handleFaceReferenceRoute(
  request: Request,
  method: string,
  deps: AppDeps,
): Promise<Response> {
  if (!deps.faceReferencesFor) {
    return json({ error: 'face_reference_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const faceReferences = deps.faceReferencesFor({ userId: user.id, accessToken });

  if (method === 'GET') {
    return handleGetFaceReference(faceReferences, user.id);
  }
  if (method === 'POST') {
    return handleRegisterFaceReference(faceReferences, user.id, await request.json());
  }

  return json({ error: 'method_not_allowed' }, 405);
}
