import { z } from 'zod';

import type { DeletionRequestRecord, DeletionRequestStore } from './accountTypes';

export type SupabaseDeletionRequestConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

const rowSchema = z.object({
  id: z.string(),
  email: z.string(),
  user_id: z.string().nullable(),
  status: z.enum(['pending_verification', 'not_found']),
  created_at: z.string(),
});

/** Durable store for signed-out deletion requests (service role, RLS: no client access). */
export function createSupabaseDeletionRequestStore(
  config: SupabaseDeletionRequestConfig,
): DeletionRequestStore {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/account_deletion_requests`;
  const headers: HeadersInit = {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    'content-type': 'application/json',
  };

  return {
    async enqueue({ email, userId, status }) {
      const response = await fetchImpl(base, {
        method: 'POST',
        headers: { ...headers, prefer: 'return=representation' },
        body: JSON.stringify({ email, user_id: userId, status }),
      });
      if (!response.ok) {
        throw new Error('deletion_request_insert_failed');
      }
      const rows = (await response.json()) as unknown[];
      return fromDb(rows[0]);
    },
    async hasRecent(email, sinceIso) {
      const url =
        `${base}?email=eq.${encodeURIComponent(email)}` +
        `&created_at=gte.${encodeURIComponent(sinceIso)}&select=id&limit=1`;
      const response = await fetchImpl(url, { headers });
      if (!response.ok) {
        throw new Error('deletion_request_lookup_failed');
      }
      return ((await response.json()) as unknown[]).length > 0;
    },
  };
}

function fromDb(raw: unknown): DeletionRequestRecord {
  const row = rowSchema.parse(raw);
  return {
    id: row.id,
    email: row.email,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at,
  };
}
