import type { AuthCredentialsPort } from '../auth/supabaseCredentials';
import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';

type SignUpBody = {
  email?: unknown;
  password?: unknown;
  firstName?: unknown;
};

type SignInBody = {
  email?: unknown;
  password?: unknown;
};

export async function handleSignUp(
  credentials: AuthCredentialsPort,
  body: unknown,
): Promise<Response> {
  const parsed = parseSignUp(body);
  const session = await credentials.signUp(parsed);
  return json({ session }, 201);
}

export async function handleSignIn(
  credentials: AuthCredentialsPort,
  body: unknown,
): Promise<Response> {
  const parsed = parseSignIn(body);
  const session = await credentials.signIn(parsed);
  return json({ session });
}

export async function handleRefresh(
  credentials: AuthCredentialsPort,
  body: unknown,
): Promise<Response> {
  const refreshToken = parseRefresh(body);
  const session = await credentials.refresh(refreshToken);
  return json({ session });
}

export async function handleGoogleSignIn(
  credentials: AuthCredentialsPort,
  body: unknown,
): Promise<Response> {
  const idToken = parseIdTokenBody(body).idToken;
  const session = await credentials.signInWithGoogleIdToken(idToken);
  return json({ session });
}

export async function handleAppleSignIn(
  credentials: AuthCredentialsPort,
  body: unknown,
): Promise<Response> {
  const parsed = parseIdTokenBody(body);
  const session = await credentials.signInWithAppleIdToken(parsed.idToken, {
    nonce: parsed.nonce,
    firstName: parsed.firstName,
  });
  return json({ session });
}

function parseSignUp(body: unknown): {
  email: string;
  password: string;
  firstName?: string;
} {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'invalid_body');
  }
  const raw = body as SignUpBody;
  if (typeof raw.email !== 'string' || typeof raw.password !== 'string') {
    throw new HttpError(400, 'invalid_body');
  }
  const firstName =
    typeof raw.firstName === 'string' && raw.firstName.trim().length > 0
      ? raw.firstName.trim()
      : undefined;
  return { email: raw.email, password: raw.password, firstName };
}

function parseSignIn(body: unknown): { email: string; password: string } {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'invalid_body');
  }
  const raw = body as SignInBody;
  if (typeof raw.email !== 'string' || typeof raw.password !== 'string') {
    throw new HttpError(400, 'invalid_body');
  }
  return { email: raw.email, password: raw.password };
}

function parseIdTokenBody(body: unknown): {
  idToken: string;
  nonce?: string;
  firstName?: string;
} {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'invalid_body');
  }
  const raw = body as { idToken?: unknown; nonce?: unknown; firstName?: unknown };
  if (typeof raw.idToken !== 'string' || raw.idToken.trim().length === 0) {
    throw new HttpError(400, 'invalid_body');
  }
  const nonce =
    typeof raw.nonce === 'string' && raw.nonce.trim().length > 0 ? raw.nonce.trim() : undefined;
  const firstName =
    typeof raw.firstName === 'string' && raw.firstName.trim().length > 0
      ? raw.firstName.trim()
      : undefined;
  return { idToken: raw.idToken.trim(), nonce, firstName };
}

function parseRefresh(body: unknown): string {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'invalid_body');
  }
  const refreshToken = (body as { refreshToken?: unknown }).refreshToken;
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    throw new HttpError(400, 'invalid_body');
  }
  return refreshToken.trim();
}

export async function handleRecover(
  credentials: AuthCredentialsPort,
  body: unknown,
  redirectTo: string,
): Promise<Response> {
  const email = (body as { email?: unknown } | null)?.email;
  if (typeof email !== 'string' || !email.trim()) {
    throw new HttpError(400, 'invalid_email');
  }
  await credentials.recover(email, redirectTo);
  // Same answer whether or not an account exists.
  return json({ ok: true });
}

export async function handleUpdatePassword(
  credentials: AuthCredentialsPort,
  accessToken: string,
  body: unknown,
): Promise<Response> {
  const password = (body as { password?: unknown } | null)?.password;
  if (typeof password !== 'string') {
    throw new HttpError(400, 'invalid_body');
  }
  await credentials.updatePassword(accessToken, password);
  return json({ ok: true });
}
