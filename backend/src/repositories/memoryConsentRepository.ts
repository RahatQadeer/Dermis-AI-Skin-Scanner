import { randomUUID } from 'node:crypto';

import type {
  ConsentGrantInput,
  ConsentRecordRow,
  ConsentRepository,
  ConsentType,
} from './consentTypes';

export function createMemoryConsentRepository(
  seed: Iterable<ConsentRecordRow> = [],
): ConsentRepository {
  const rows = new Map<string, ConsentRecordRow>();
  for (const row of seed) {
    rows.set(row.id, structuredClone(row));
  }
  return {
    listByUserId: async (userId) =>
      [...rows.values()]
        .filter((r) => r.userId === userId)
        .sort((a, b) => b.grantedAt.localeCompare(a.grantedAt))
        .map((r) => structuredClone(r)),
    findActive: async (userId, type) => findActive(rows, userId, type),
    insertGrant: async (input) => insertGrant(rows, input),
    revokeActive: async (userId, type) => revokeActive(rows, userId, type),
    deleteAllForUser: async (userId) => {
      for (const row of [...rows.values()]) {
        if (row.userId === userId) {
          rows.delete(row.id);
        }
      }
    },
  };
}

function findActive(
  rows: Map<string, ConsentRecordRow>,
  userId: string,
  type: ConsentType,
): ConsentRecordRow | null {
  let best: ConsentRecordRow | null = null;
  for (const row of rows.values()) {
    if (row.userId !== userId || row.type !== type || row.revokedAt) {
      continue;
    }
    if (!best || row.grantedAt > best.grantedAt) {
      best = row;
    }
  }
  return best ? structuredClone(best) : null;
}

function insertGrant(
  rows: Map<string, ConsentRecordRow>,
  input: ConsentGrantInput,
): ConsentRecordRow {
  const now = new Date().toISOString();
  const row: ConsentRecordRow = {
    id: randomUUID(),
    userId: input.userId,
    type: input.type,
    version: input.version,
    grantedAt: now,
    revokedAt: null,
    createdAt: now,
  };
  rows.set(row.id, row);
  return structuredClone(row);
}

function revokeActive(
  rows: Map<string, ConsentRecordRow>,
  userId: string,
  type: ConsentType,
): ConsentRecordRow | null {
  const active = findActive(rows, userId, type);
  if (!active) {
    return null;
  }
  const stored = rows.get(active.id);
  if (!stored) {
    return null;
  }
  stored.revokedAt = new Date().toISOString();
  rows.set(stored.id, stored);
  return structuredClone(stored);
}
