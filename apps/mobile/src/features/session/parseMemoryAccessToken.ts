const MEMORY_PREFIX = 'user:';

export type ParsedMemoryAccessToken = {
  userId: string;
  email: string | null;
};

/** Parses dev/memory bearer `user:<uuid>[:email]`. */
export function parseMemoryAccessToken(token: string): ParsedMemoryAccessToken | null {
  if (!token.startsWith(MEMORY_PREFIX)) {
    return null;
  }
  const rest = token.slice(MEMORY_PREFIX.length);
  const parts = rest.split(':');
  const userId = parts[0]?.trim();
  if (!userId) {
    return null;
  }
  const email = parts[1]?.trim().toLowerCase() ?? null;
  return { userId, email };
}
