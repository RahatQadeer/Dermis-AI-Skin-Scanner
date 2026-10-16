import { HttpError } from '../http/HttpError';
import type { AuthenticatedUser, AuthPort } from './AuthPort';
import { extractBearer } from './extractBearer';

export async function requireUser(
  request: Request,
  auth: AuthPort,
): Promise<{ user: AuthenticatedUser; accessToken: string }> {
  const accessToken = extractBearer(request.headers.get('authorization'));
  if (!accessToken) {
    throw new HttpError(401, 'missing_token');
  }

  const user = await auth.verifyAccessToken(accessToken);
  if (!user) {
    throw new HttpError(401, 'invalid_token');
  }

  return { user, accessToken };
}
