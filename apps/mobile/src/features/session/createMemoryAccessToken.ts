/**
 * Dev/memory-backend bearer: `user:<uuid>:<email>`.
 * Real Supabase JWTs replace this when auth is wired to Supabase.
 */
export function createMemoryAccessToken(email: string, userId?: string): string {
  const id = userId ?? createUuid();
  const normalized = email.trim().toLowerCase() || 'user@example.com';
  return `user:${id}:${normalized}`;
}

function createUuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  // Fallback for rare environments without Web Crypto.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
