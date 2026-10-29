import { HttpError } from '../http/HttpError';

export type AuthSessionResult = {
  accessToken: string;
  refreshToken: string | null;
  user: { id: string; email: string | null; firstName: string | null };
};

export type GoTrueUserMeta = {
  first_name?: unknown;
  full_name?: unknown;
  name?: unknown;
};

export type GoTrueTokenBody = {
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

export function toSession(body: GoTrueTokenBody): AuthSessionResult {
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

export function withSignupName(
  session: AuthSessionResult,
  signupName: string | null,
): AuthSessionResult {
  if (!signupName) {
    return session;
  }
  return {
    ...session,
    user: { ...session.user, firstName: session.user.firstName ?? signupName },
  };
}

export function mapGoTrueError(status: number, body: GoTrueTokenBody): HttpError {
  const msg = `${body.error_description ?? body.msg ?? body.error ?? ''}`.toLowerCase();
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
