import { HttpError } from '../http/HttpError';

import {
  mapGoTrueError,
  toSession,
  withSignupName,
  type AuthSessionResult,
  type GoTrueTokenBody,
} from './goTrueShared';

export type IdTokenCredCtx = {
  fetchImpl: typeof fetch;
  base: string;
  config: { anonKey: string };
};

type IdTokenProvider = 'google' | 'apple';

/** Exchange a provider ID token for a Supabase session (provider must be enabled in Supabase). */
export async function signInWithProviderIdToken(
  ctx: IdTokenCredCtx,
  input: {
    provider: IdTokenProvider;
    idToken: string;
    nonce?: string;
    firstName?: string;
  },
): Promise<AuthSessionResult> {
  const token = input.idToken.trim();
  if (!token) {
    throw new HttpError(400, 'invalid_body');
  }
  const nonce = input.nonce?.trim();
  const response = await ctx.fetchImpl(`${ctx.base}/auth/v1/token?grant_type=id_token`, {
    method: 'POST',
    headers: {
      apikey: ctx.config.anonKey,
      authorization: `Bearer ${ctx.config.anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      provider: input.provider,
      id_token: token,
      ...(nonce ? { nonce } : {}),
    }),
  });
  const body = (await response.json()) as GoTrueTokenBody;
  if (!response.ok || !body.access_token || !body.user?.id) {
    logIdTokenFailure(input.provider, response.status, body, Boolean(nonce));
    throw mapGoTrueError(response.status, body);
  }
  const session = toSession(body);
  if (input.provider !== 'apple') {
    return session;
  }
  return maybeApplyAppleFirstName(ctx, session, input.firstName);
}

function logIdTokenFailure(
  provider: IdTokenProvider,
  status: number,
  body: GoTrueTokenBody,
  noncePresent: boolean,
): void {
  const safeDetail = `${body.error ?? ''}:${body.error_description ?? body.msg ?? ''}`.slice(
    0,
    160,
  );
  console.warn(
    '[auth] id_token exchange failed',
    provider,
    status,
    safeDetail,
    noncePresent ? 'nonce=present' : 'nonce=absent',
  );
}

async function maybeApplyAppleFirstName(
  ctx: IdTokenCredCtx,
  session: AuthSessionResult,
  firstName: string | undefined,
): Promise<AuthSessionResult> {
  const name = firstName?.trim();
  if (!name || session.user.firstName) {
    return withSignupName(session, name ?? null);
  }
  try {
    await updateGoTrueUserMetadata(ctx, session.accessToken, {
      first_name: name,
      full_name: name,
    });
  } catch {
    // Best-effort: session is still valid; name may only apply for this client session.
  }
  return withSignupName(session, name);
}

async function updateGoTrueUserMetadata(
  ctx: IdTokenCredCtx,
  accessToken: string,
  data: { first_name: string; full_name: string },
): Promise<void> {
  const response = await ctx.fetchImpl(`${ctx.base}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: ctx.config.anonKey,
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });
  if (!response.ok) {
    throw new HttpError(502, 'auth_provider_error');
  }
}
