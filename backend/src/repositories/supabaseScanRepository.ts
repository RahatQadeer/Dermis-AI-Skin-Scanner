import { concernScoresSchema, concernWeightsSchema, zoneScoresSchema } from '@dermis/domain/server';
import { z } from 'zod';

import type { ScanInsert, ScanRecordRow, ScanRepository } from './scanTypes';

export type SupabaseScanConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

const dbScanRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  taken_at: z.string(),
  index_score: z.number().int(),
  concerns: concernScoresSchema,
  zones: zoneScoresSchema,
  weights: concernWeightsSchema,
  formula_version: z.string(),
  model: z.string(),
  prompt_version: z.string(),
  idempotency_key: z.string(),
  created_at: z.string(),
});

type RestClient = {
  fetchImpl: typeof fetch;
  base: string;
  headers: HeadersInit;
};

/** Persist scans via PostgREST + service_role (RLS blocks client inserts). */
export function createSupabaseScanRepository(config: SupabaseScanConfig): ScanRepository {
  const client = makeClient(config);
  return {
    findByIdempotencyKey: (userId, key) => findByIdempotency(client, userId, key),
    insert: (row) => insertScan(client, row),
    deleteById: (id) => deleteById(client, id),
    listByUserId: (userId) => listByUser(client, userId),
    deleteAllForUser: (userId) => deleteAllForUser(client, userId),
  };
}

function makeClient(config: SupabaseScanConfig): RestClient {
  return {
    fetchImpl: config.fetchImpl ?? fetch,
    base: `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/scans`,
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
  };
}

async function findByIdempotency(
  client: RestClient,
  userId: string,
  key: string,
): Promise<ScanRecordRow | null> {
  const url =
    `${client.base}?user_id=eq.${encodeURIComponent(userId)}` +
    `&idempotency_key=eq.${encodeURIComponent(key)}&select=*&limit=1`;
  const response = await client.fetchImpl(url, { headers: client.headers });
  if (!response.ok) {
    throw new Error('scan_lookup_failed');
  }
  const rows = (await response.json()) as unknown[];
  return rows[0] ? fromDb(rows[0]) : null;
}

async function insertScan(client: RestClient, input: ScanInsert): Promise<ScanRecordRow> {
  const existing = await findByIdempotency(client, input.userId, input.idempotencyKey);
  if (existing) {
    return existing;
  }
  const response = await client.fetchImpl(client.base, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify(toDb(input)),
  });
  if (!response.ok) {
    const replay = await findByIdempotency(client, input.userId, input.idempotencyKey);
    if (replay) {
      return replay;
    }
    throw new Error('scan_insert_failed');
  }
  const rows = (await response.json()) as unknown[];
  return fromDb(rows[0]);
}

async function deleteById(client: RestClient, id: string): Promise<void> {
  const response = await client.fetchImpl(`${client.base}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: client.headers,
  });
  if (!response.ok) {
    throw new Error('scan_delete_failed');
  }
}

async function listByUser(client: RestClient, userId: string): Promise<ScanRecordRow[]> {
  const url =
    `${client.base}?user_id=eq.${encodeURIComponent(userId)}` + `&select=*&order=taken_at.desc`;
  const response = await client.fetchImpl(url, { headers: client.headers });
  if (!response.ok) {
    throw new Error('scan_list_failed');
  }
  const rows = (await response.json()) as unknown[];
  return rows.map((row) => fromDb(row));
}

async function deleteAllForUser(client: RestClient, userId: string): Promise<number> {
  const existing = await listByUser(client, userId);
  if (existing.length === 0) {
    return 0;
  }
  const response = await client.fetchImpl(
    `${client.base}?user_id=eq.${encodeURIComponent(userId)}`,
    { method: 'DELETE', headers: client.headers },
  );
  if (!response.ok) {
    throw new Error('scan_delete_all_failed');
  }
  return existing.length;
}

function toDb(input: ScanInsert): Record<string, unknown> {
  return {
    ...(input.id ? { id: input.id } : {}),
    user_id: input.userId,
    taken_at: input.takenAt,
    index_score: input.indexScore,
    concerns: input.concerns,
    zones: input.zones,
    weights: input.weights,
    formula_version: input.formulaVersion,
    model: input.model,
    prompt_version: input.promptVersion,
    idempotency_key: input.idempotencyKey,
  };
}

function fromDb(raw: unknown): ScanRecordRow {
  const row = dbScanRowSchema.parse(raw);
  return {
    id: row.id,
    userId: row.user_id,
    takenAt: row.taken_at,
    indexScore: row.index_score,
    concerns: row.concerns,
    zones: row.zones,
    weights: row.weights,
    formulaVersion: row.formula_version,
    model: row.model,
    promptVersion: row.prompt_version,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
  };
}
