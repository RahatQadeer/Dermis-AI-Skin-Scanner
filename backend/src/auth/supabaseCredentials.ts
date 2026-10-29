import { isPasswordAcceptable } from '@dermis/domain/server';

import { HttpError } from '../http/HttpError';

export type AuthSessionResult = {
  accessToken: string;
  refreshToken: string | null;
  user: { id: string; email: string | null; firstName: string | null };
};

export type SupabaseCredentialsConfig = {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  fetchImpl?: typeof fetch;
};

type GoTrueUserMeta = {
  first_name?: unknown;
  full_name?: unknown;
  name?: unknown;
};

type GoTrueTokenBody = {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id?: string;
    email?: string | null;
    user_metadata?: GoTrueUserMeta | null;
    raw_user_meta_data?: GoTrueUserMeta | null;
  };
  error?: string;
  error_description?: string;
  msg?: string;
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
    signInWithGoogleIdToken: (idToken: string) => signInWithGoogleIdToken(ctx, idToken),
    refresh: (refreshToken: string) => refreshWithGoTrue(ctx, refreshToken),
  };
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
  if (ctx.config.serviceRoleKey) {
    await adminCreateUser(ctx.fetchImpl, ctx.base, ctx.config.serviceRoleKey, {
      email,
      password: input.password,
      firstName: input.firstName,
    });
    const session = await passwordGrant({
      fetchImpl: ctx.fetchImpl,
      base: ctx.base,
      anonKey: ctx.config.anonKey,
      email,
      password: input.password,
    });
    return withSignupName(session, signedUpName);
  }
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

/** Exchange a Google ID token for a Supabase session (provider must be enabled in Supabase). */
async function signInWithGoogleIdToken(ctx: CredCtx, idToken: string): Promise<AuthSessionResult> {
  const token = idToken.trim();
  if (!token) {
    throw new HttpError(400, 'invalid_body');
  }
  const response = await ctx.fetchImpl(`${ctx.base}/auth/v1/token?grant_type=id_token`, {
    method: 'POST',
    headers: {
      apikey: ctx.config.anonKey,
      authorization: `Bearer ${ctx.config.anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ provider: 'google', id_token: token }),
  });
  const body = (await response.json()) as GoTrueTokenBody;
  if (!response.ok || !body.access_token || !body.user?.id) {
    throw mapGoTrueError(response.status, body);
  }
  return toSession(body);
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

async function adminCreateUser(
  fetchImpl: typeof fetch,
  base: string,
  serviceRoleKey: string,
  input: { email: string; password: string; firstName?: string },
): Promise<void> {
  const response = await fetchImpl(`${base}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: input.firstName
        ? { first_name: input.firstName.trim(), full_name: input.firstName.trim() }
        : {},
    }),
  });
  if (response.ok) {
    return;
  }
  const body = (await response.json()) as GoTrueTokenBody;
  throw mapGoTrueError(response.status, body);
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

function toSession(body: GoTrueTokenBody): AuthSessionResult {
  return {
    accessToken: body.access_token as string,
    refreshToken: body.refresh_token ?? null,
    user: {
      id: body.user!.id as string,
      email: body.user?.email ?? null,
      firstName: nameFromGoTrueUser(body.user),
    },
  };
}

function withSignupName(session: AuthSessionResult, signupName: string | null): AuthSessionResult {
  if (!signupName) {
    return session;
  }
  return {
    ...session,
    user: { ...session.user, firstName: session.user.firstName ?? signupName },
  };
}

function nameFromGoTrueUser(user: GoTrueTokenBody['user']): string | null {
  if (!user) {
    return null;
  }
  return readMetaName(user.user_metadata) ?? readMetaName(user.raw_user_meta_data) ?? null;
}

function readMetaName(meta: GoTrueUserMeta | null | undefined): string | null {
  if (!meta) {
    return null;
  }
  for (const key of ['full_name', 'first_name', 'name'] as const) {
    const value = meta[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function goTrueMessage(body: GoTrueTokenBody): string {
  return `${body.error_description ?? body.msg ?? body.error ?? ''}`.toLowerCase();
}

function mapGoTrueError(status: number, body: GoTrueTokenBody): HttpError {
  const msg = goTrueMessage(body);
  if (isEmailTakenMessage(msg, status)) {
    return new HttpError(409, 'email_taken');
  }
  if (isInvalidCredentialsMessage(msg, status)) {
    return new HttpError(401, 'invalid_credentials');
  }
  if (status === 429) {
    return new HttpError(429, 'rate_limited');
  }
  return new HttpError(status >= 400 && status < 600 ? status : 502, 'auth_provider_error');
}

function isEmailTakenMessage(msg: string, status: number): boolean {
  return msg.includes('already') || msg.includes('registered') || status === 422;
}

function isInvalidCredentialsMessage(msg: string, status: number): boolean {
  return msg.includes('invalid login') || msg.includes('invalid_credentials') || status === 400;
}
