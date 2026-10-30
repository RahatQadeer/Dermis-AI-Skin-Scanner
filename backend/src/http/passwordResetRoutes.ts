import { extractBearer } from '../auth/extractBearer';
import { handleRecover, handleUpdatePassword } from '../handlers/authCredentialHandlers';
import { HttpError } from './HttpError';
import type { AppDeps } from './createApp';
import { readJsonBody } from './readJsonBody';
import { RESET_PASSWORD_HTML } from './resetPasswordPage';
import { json } from './respond';

/** Path of the hosted page the reset email links to (add to Supabase redirect URLs). */
export const RESET_PASSWORD_PATH = '/reset-password';

export function serveResetPasswordPage(): Response {
  return new Response(RESET_PASSWORD_HTML, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // The page reads a recovery token from the URL fragment — never cache or frame it.
      'cache-control': 'no-store',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer',
    },
  });
}

export async function handlePublicRecover(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  return handleRecover(deps.credentials, await readJsonBody(request), resetPageUrl(request));
}

/** Called by the reset page with the recovery access token from the email link. */
export async function handlePublicUpdatePassword(
  request: Request,
  deps: AppDeps,
): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  const token = extractBearer(request.headers.get('authorization'));
  if (!token) {
    throw new HttpError(401, 'missing_token');
  }
  return handleUpdatePassword(deps.credentials, token, await readJsonBody(request));
}

/** Absolute URL of the reset page on this API host (TLS terminates at the proxy). */
function resetPageUrl(request: Request): string {
  const configured = process.env.PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (configured) {
    return `${configured}${RESET_PASSWORD_PATH}`;
  }
  const url = new URL(request.url);
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const origin = proto ? `${proto}://${url.host}` : url.origin;
  return `${origin}${RESET_PASSWORD_PATH}`;
}

/** Public routes for the forgot-password flow (merged into the public route table). */
export const PASSWORD_RESET_ROUTES: Record<
  string,
  (request: Request, deps: AppDeps) => Promise<Response> | Response
> = {
  'POST /v1/auth/recover': handlePublicRecover,
  'POST /v1/auth/password': handlePublicUpdatePassword,
  [`GET ${RESET_PASSWORD_PATH}`]: serveResetPasswordPage,
};
