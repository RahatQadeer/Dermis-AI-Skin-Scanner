import type { AuthenticatedUser, AuthPort } from './AuthPort';

export type SupabaseAuthConfig = {
  supabaseUrl: string;
  anonKey: string;
  fetchImpl?: typeof fetch;
};

type AuthUserMeta = {
  first_name?: unknown;
  full_name?: unknown;
  name?: unknown;
};

type AuthUserResponse = {
  id?: string;
  email?: string | null;
  user_metadata?: AuthUserMeta | null;
  raw_user_meta_data?: AuthUserMeta | null;
};

/**
 * Validates a Supabase access token via Auth `/user` (GoTrue).
 */
export function createSupabaseAuthPort(config: SupabaseAuthConfig): AuthPort {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = config.supabaseUrl.replace(/\/$/, '');

  return {
    async verifyAccessToken(accessToken) {
      const response = await fetchImpl(`${base}/auth/v1/user`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
          apikey: config.anonKey,
        },
      });
      if (!response.ok) {
        return null;
      }
      const body = (await response.json()) as AuthUserResponse;
      if (!body.id) {
        return null;
      }
      return toUser(body);
    },
  };
}

function toUser(body: AuthUserResponse): AuthenticatedUser {
  return {
    id: body.id as string,
    email: body.email ?? null,
    firstName: readMetaName(body.user_metadata) ?? readMetaName(body.raw_user_meta_data),
  };
}

function readMetaName(meta: AuthUserMeta | null | undefined): string | null {
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
