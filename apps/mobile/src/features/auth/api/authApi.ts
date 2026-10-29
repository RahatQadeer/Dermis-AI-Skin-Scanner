import { getApiClient } from '@/src/lib/api/client';

export type AuthSessionDto = {
  accessToken: string;
  refreshToken: string | null;
  user: { id: string; email: string | null; firstName: string | null };
};

type AuthSessionResponse = {
  session: AuthSessionDto;
};

function normalizeSession(session: AuthSessionDto): AuthSessionDto {
  const firstName =
    typeof session.user.firstName === 'string' && session.user.firstName.trim().length > 0
      ? session.user.firstName.trim()
      : null;
  return {
    ...session,
    user: {
      ...session.user,
      firstName,
    },
  };
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  firstName: string;
}): Promise<AuthSessionDto> {
  const res = await getApiClient().postPublic<AuthSessionResponse>('/v1/auth/sign-up', {
    email: input.email.trim(),
    password: input.password,
    firstName: input.firstName.trim(),
  });
  return normalizeSession(res.session);
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthSessionDto> {
  const res = await getApiClient().postPublic<AuthSessionResponse>('/v1/auth/sign-in', {
    email: input.email.trim(),
    password: input.password,
  });
  return normalizeSession(res.session);
}

export async function signInWithGoogleIdToken(idToken: string): Promise<AuthSessionDto> {
  const res = await getApiClient().postPublic<AuthSessionResponse>('/v1/auth/google', {
    idToken: idToken.trim(),
  });
  return normalizeSession(res.session);
}

export async function signInWithAppleIdToken(input: {
  idToken: string;
  nonce: string;
  firstName?: string;
}): Promise<AuthSessionDto> {
  const res = await getApiClient().postPublic<AuthSessionResponse>('/v1/auth/apple', {
    idToken: input.idToken.trim(),
    nonce: input.nonce.trim(),
    ...(input.firstName ? { firstName: input.firstName } : {}),
  });
  return normalizeSession(res.session);
}

export async function refreshSession(refreshToken: string): Promise<AuthSessionDto> {
  const res = await getApiClient().postPublic<AuthSessionResponse>('/v1/auth/refresh', {
    refreshToken,
  });
  return normalizeSession(res.session);
}
