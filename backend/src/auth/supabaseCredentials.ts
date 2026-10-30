import { isPasswordAcceptable } from '@dermis/domain/server';

import { HttpError } from '../http/HttpError';
import {
  mapGoTrueError,
  toSession,
  withSignupName,
  type AuthSessionResult,
  type GoTrueTokenBody,
} from './goTrueShared';
import { signInWithProviderIdToken } from './supabaseIdTokenSignIn';

export type { AuthSessionResult } from './goTrueShared';

export type SupabaseCredentialsConfig = {
  supabaseUrl: string;
  anonKey: string;
  fetchImpl?: typeof fetch;
};

export type AppleIdTokenOptions = {
  nonce?: string;
  firstName?: string;
};

/**
 * Email/password against Supabase GoTrue (password hits our API, then Supabase).
 */
export function createSupabaseCredentialsPort(config: SupabaseCredentialsConfig) {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = config.supabaseUrl.replace(/\/$/, '');
  const ctx = { fetchImpl, base, config };

  return {
    signUp: (input: { email: string; password: string; firstName?: string }) =>
      signUpWithGoTrue(ctx, input),
    signIn: (input: { email: string; password: string }) => signInWithGoTrue(ctx, input),
    signInWithGoogleIdToken: (idToken: string) =>
      signInWithProviderIdToken(ctx, { provider: 'google', idToken }),
    signInWithAppleIdToken: (idToken: string, options?: AppleIdTokenOptions) =>
      signInWithProviderIdToken(ctx, {
        provider: 'apple',
        idToken,
        nonce: options?.nonce,
        firstName: options?.firstName,
      }),
    refresh: (refreshToken: string) => refreshWithGoTrue(ctx, refreshToken),
    recover: (email: string, redirectTo: string) => recoverWithGoTrue(ctx, email, redirectTo),
    updatePassword: (accessToken: string, password: string) =>
      updatePasswordWithGoTrue(ctx, accessToken, password),
  };
}

/**
 * Sends the password-reset email. Never reveals whether the email exists:
 * GoTrue answers the same for unknown addresses; only throttling surfaces.
 */
async function recoverWithGoTrue(ctx: CredCtx, email: string, redirectTo: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const url = `${ctx.base}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`;
  const response = await ctx.fetchImpl(url, {
    method: 'POST',
    headers: {
      apikey: ctx.config.anonKey,
      authorization: `Bearer ${ctx.config.anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email: normalized }),
  });
  if (response.status === 429) {
    throw new HttpError(429, 'rate_limited');
  }
  if (!response.ok) {
    console.error('[auth] recover failed', response.status);
  }
}

/** Sets a new password using the short-lived recovery session from the reset link. */
async function updatePasswordWithGoTrue(
  ctx: CredCtx,
  accessToken: string,
  password: string,
): Promise<void> {
  assertPassword(password);
  const response = await ctx.fetchImpl(`${ctx.base}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: ctx.config.anonKey,
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as GoTrueTokenBody;
    throw mapGoTrueError(response.status, body);
  }
}

type CredCtx = {
  fetchImpl: typeof fetch;
  base: string;
  config: SupabaseCredentialsConfig;
};

async function signUpWithGoTrue(
  ctx: CredCtx,
  input: { email: string; password: string; firstName?: string },
): Promise<AuthSessionResult> {
  const email = normalizeEmail(input.email);
  assertPassword(input.password);
  const signedUpName = input.firstName?.trim() || null;
  // Always the public sign-up endpoint: it honours the project's "Confirm email"
  // setting. Creating users through the admin API with email_confirm=true
  // marked unproven addresses as verified, letting someone pre-register a
  // victim's email and inherit their later Google/Apple sign-in via automatic
  // identity linking.
  const session = await anonSignUp(ctx.fetchImpl, ctx.base, ctx.config.anonKey, {
    email,
    password: input.password,
    firstName: input.firstName,
  });
  return withSignupName(session, signedUpName);
}

async function signInWithGoTrue(
  ctx: CredCtx,
  input: { email: string; password: string },
): Promise<AuthSessionResult> {
  const email = normalizeEmail(input.email);
  if (!input.password) {
    throw new HttpError(400, 'invalid_credentials');
  }
  return passwordGrant({
    fetchImpl: ctx.fetchImpl,
    base: ctx.base,
    anonKey: ctx.config.anonKey,
    email,
    password: input.password,
  });
}

async function refreshWithGoTrue(ctx: CredCtx, refreshToken: string): Promise<AuthSessionResult> {
  if (!refreshToken.trim()) {
    throw new HttpError(400, 'invalid_body');
  }
  return refreshGrant(ctx.fetchImpl, ctx.base, ctx.config.anonKey, refreshToken.trim());
}

export type AuthCredentialsPort = ReturnType<typeof createSupabaseCredentialsPort>;

function normalizeEmail(email: string): string {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new HttpError(400, 'invalid_email');
  }
  return value;
}

function assertPassword(password: string): void {
  if (!isPasswordAcceptable(password)) {
    throw new HttpError(400, 'weak_password');
  }
}

async function anonSignUp(
  fetchImpl: typeof fetch,
  base: string,
  anonKey: string,
  input: { email: string; password: string; firstName?: string },
): Promise<AuthSessionResult> {
  const response = await fetchImpl(`${base}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: input.firstName
        ? { first_name: input.firstName.trim(), full_name: input.firstName.trim() }
        : undefined,
    }),
  });
  const body = (await response.json()) as GoTrueTokenBody;
  if (!response.ok) {
    throw mapGoTrueError(response.status, body);
  }
  if (!body.access_token || !body.user?.id) {
    throw new HttpError(403, 'email_confirmation_required');
  }
  return toSession(body);
}

async function passwordGrant(opts: {
  fetchImpl: typeof fetch;
  base: string;
  anonKey: string;
  email: string;
  password: string;
}): Promise<AuthSessionResult> {
  const response = await opts.fetchImpl(`${opts.base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: opts.anonKey,
      authorization: `Bearer ${opts.anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email: opts.email, password: opts.password }),
  });
  const body = (await response.json()) as GoTrueTokenBody;
  if (!response.ok || !body.access_token || !body.user?.id) {
    throw mapGoTrueError(response.status, body);
  }
  return toSession(body);
}

async function refreshGrant(
  fetchImpl: typeof fetch,
  base: string,
  anonKey: string,
  refreshToken: string,
): Promise<AuthSessionResult> {
  const response = await fetchImpl(`${base}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const body = (await response.json()) as GoTrueTokenBody;
  if (!response.ok || !body.access_token || !body.user?.id) {
    throw mapGoTrueError(response.status, body);
  }
  return toSession(body);
}
