import type { ConcernId } from '@dermis/domain';

import type {
  ProfilePatchInput,
  ProfileRecord,
  ProfileRepository,
  ProfileWriteInput,
} from './profileTypes';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyRecord(userId: string): ProfileRecord {
  const stamp = nowIso();
  return {
    id: userId,
    skinType: null,
    skinTone: null,
    sensitivity: null,
    priorityConcerns: [],
    notifyScanReminders: false,
    notifyProductUpdates: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function createMemoryProfileRepository(
  seed: Iterable<ProfileRecord> = [],
): ProfileRepository {
  const store = new Map<string, ProfileRecord>();
  for (const row of seed) {
    store.set(row.id, structuredClone(row));
  }
  return buildMemoryRepo(store);
}

function buildMemoryRepo(store: Map<string, ProfileRecord>): ProfileRepository {
  return {
    async findByUserId(userId) {
      const row = store.get(userId);
      return row ? structuredClone(row) : null;
    },
    async insertEmpty(userId) {
      if (store.has(userId)) {
        return structuredClone(store.get(userId)!);
      }
      const row = emptyRecord(userId);
      store.set(userId, row);
      return structuredClone(row);
    },
    async save(userId, data) {
      const previous = store.get(userId) ?? emptyRecord(userId);
      const next = applyWrite(previous, data);
      store.set(userId, next);
      return structuredClone(next);
    },
    async patch(userId, data) {
      const previous = store.get(userId);
      if (!previous) {
        return null;
      }
      const next = applyPatch(previous, data);
      store.set(userId, next);
      return structuredClone(next);
    },
    async clearSkinData(userId) {
      return clearSkin(store, userId);
    },
    async deleteByUserId(userId) {
      return store.delete(userId);
    },
  };
}

function clearSkin(store: Map<string, ProfileRecord>, userId: string): ProfileRecord | null {
  const previous = store.get(userId);
  if (!previous) {
    return null;
  }
  const next: ProfileRecord = {
    ...previous,
    skinType: null,
    skinTone: null,
    sensitivity: null,
    priorityConcerns: [],
    updatedAt: nowIso(),
  };
  store.set(userId, next);
  return structuredClone(next);
}

function applyWrite(previous: ProfileRecord, data: ProfileWriteInput): ProfileRecord {
  return {
    ...previous,
    skinType: data.skinType,
    skinTone: data.skinTone,
    sensitivity: data.sensitivity,
    priorityConcerns: [...data.priorityConcerns] as ConcernId[],
    notifyScanReminders: data.notifyScanReminders ?? previous.notifyScanReminders,
    notifyProductUpdates: data.notifyProductUpdates ?? previous.notifyProductUpdates,
    updatedAt: nowIso(),
  };
}

function applyPatch(previous: ProfileRecord, data: ProfilePatchInput): ProfileRecord {
  return {
    ...previous,
    skinType: data.skinType ?? previous.skinType,
    skinTone: data.skinTone ?? previous.skinTone,
    sensitivity: data.sensitivity ?? previous.sensitivity,
    priorityConcerns:
      data.priorityConcerns !== undefined
        ? ([...data.priorityConcerns] as ConcernId[])
        : previous.priorityConcerns,
    notifyScanReminders: data.notifyScanReminders ?? previous.notifyScanReminders,
    notifyProductUpdates: data.notifyProductUpdates ?? previous.notifyProductUpdates,
    updatedAt: nowIso(),
  };
}
