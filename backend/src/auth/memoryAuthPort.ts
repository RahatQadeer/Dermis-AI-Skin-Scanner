import type { AuthenticatedUser, AuthPort } from './AuthPort';

export type MemoryAuthOptions = {
  users?: ReadonlyMap<string, AuthenticatedUser>;
  /** After account deletion, tokens for these ids are rejected. */
  deletedUserIds?: Set<string>;
};

/** Test/dev auth: token format `user:<uuid>` or `user:<uuid>:<email>`. */
export function createMemoryAuthPort(
  usersOrOptions: ReadonlyMap<string, AuthenticatedUser> | MemoryAuthOptions = new Map(),
): AuthPort {
  const options = normalizeOptions(usersOrOptions);
  return {
    async verifyAccessToken(accessToken) {
      if (!accessToken.startsWith('user:')) {
        return null;
      }
      const rest = accessToken.slice('user:'.length);
      const [id, email] = rest.split(':');
      if (!id) {
        return null;
      }
      if (options.deletedUserIds?.has(id)) {
        return null;
      }
      const known = options.users.get(id);
      if (known) {
        return known;
      }
      return { id, email: email && email.length > 0 ? email : null, firstName: null };
    },
  };
}

function normalizeOptions(input: ReadonlyMap<string, AuthenticatedUser> | MemoryAuthOptions): {
  users: ReadonlyMap<string, AuthenticatedUser>;
  deletedUserIds?: Set<string>;
} {
  if (input instanceof Map || isReadonlyMap(input)) {
    return { users: input };
  }
  return {
    users: input.users ?? new Map(),
    deletedUserIds: input.deletedUserIds,
  };
}

function isReadonlyMap(value: unknown): value is ReadonlyMap<string, AuthenticatedUser> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'get' in value &&
    typeof (value as { get: unknown }).get === 'function' &&
    !('users' in value) &&
    !('deletedUserIds' in value)
  );
}
