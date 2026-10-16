import { randomUUID } from 'node:crypto';

import type { ScanInsert, ScanRecordRow, ScanRepository } from './scanTypes';

export function createMemoryScanRepository(seed: Iterable<ScanRecordRow> = []): ScanRepository {
  const byId = new Map<string, ScanRecordRow>();
  const byIdempotency = new Map<string, string>();
  seedMaps(byId, byIdempotency, seed);
  return {
    findByIdempotencyKey: (userId, key) => findByIdem(byId, byIdempotency, userId, key),
    insert: (input) => insertScan(byId, byIdempotency, input),
    deleteById: async (id) => deleteScan(byId, byIdempotency, id),
    listByUserId: async (userId) =>
      [...byId.values()].filter((r) => r.userId === userId).map((r) => structuredClone(r)),
    deleteAllForUser: async (userId) => deleteAllForUser(byId, byIdempotency, userId),
  };
}

function seedMaps(
  byId: Map<string, ScanRecordRow>,
  byIdempotency: Map<string, string>,
  seed: Iterable<ScanRecordRow>,
): void {
  for (const row of seed) {
    byId.set(row.id, structuredClone(row));
    byIdempotency.set(idemKey(row.userId, row.idempotencyKey), row.id);
  }
}

async function findByIdem(
  byId: Map<string, ScanRecordRow>,
  byIdempotency: Map<string, string>,
  userId: string,
  idempotencyKey: string,
): Promise<ScanRecordRow | null> {
  const id = byIdempotency.get(idemKey(userId, idempotencyKey));
  if (!id) {
    return null;
  }
  const row = byId.get(id);
  return row ? structuredClone(row) : null;
}

async function insertScan(
  byId: Map<string, ScanRecordRow>,
  byIdempotency: Map<string, string>,
  input: ScanInsert,
): Promise<ScanRecordRow> {
  const existing = byIdempotency.get(idemKey(input.userId, input.idempotencyKey));
  if (existing) {
    return structuredClone(byId.get(existing)!);
  }
  const id = input.id ?? randomUUID();
  const row: ScanRecordRow = { ...input, id, createdAt: new Date().toISOString() };
  byId.set(id, row);
  byIdempotency.set(idemKey(input.userId, input.idempotencyKey), id);
  return structuredClone(row);
}

function deleteScan(
  byId: Map<string, ScanRecordRow>,
  byIdempotency: Map<string, string>,
  id: string,
): void {
  const row = byId.get(id);
  if (!row) {
    return;
  }
  byId.delete(id);
  byIdempotency.delete(idemKey(row.userId, row.idempotencyKey));
}

function deleteAllForUser(
  byId: Map<string, ScanRecordRow>,
  byIdempotency: Map<string, string>,
  userId: string,
): number {
  let count = 0;
  for (const row of [...byId.values()]) {
    if (row.userId !== userId) {
      continue;
    }
    byId.delete(row.id);
    byIdempotency.delete(idemKey(row.userId, row.idempotencyKey));
    count += 1;
  }
  return count;
}

function idemKey(userId: string, key: string): string {
  return `${userId}:${key}`;
}
