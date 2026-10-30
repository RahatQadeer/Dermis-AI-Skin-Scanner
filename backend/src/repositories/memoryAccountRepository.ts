import { randomUUID } from 'node:crypto';

import type {
  AccountDataPort,
  AccountExportPayload,
  AuthAdminPort,
  DeletionRequestRecord,
  DeletionRequestStore,
} from './accountTypes';
import type { ConsentRepository } from './consentTypes';
import type { EntitlementRepository } from './entitlementTypes';
import type { ProfileRepository } from './profileTypes';
import type { QuotaRepository } from './quotaTypes';
import type { RoutineRepository } from './routineTypes';
import type { ScanRepository } from './scanTypes';

export type MemoryAccountDeps = {
  profiles: ProfileRepository;
  entitlements: EntitlementRepository;
  quota: QuotaRepository;
  scans: ScanRepository;
  routine: RoutineRepository;
  consents: ConsentRepository;
  /** Normalized email → userId for public deletion lookup. */
  emailIndex: Map<string, string>;
};

export function createMemoryAccountDataPort(deps: MemoryAccountDeps): AccountDataPort {
  return {
    exportForUser: (userId, email) => exportForUser(deps, userId, email),
    purgeUserData: (userId) => purgeUserData(deps, userId),
    findUserIdByEmail: async (email) => deps.emailIndex.get(normalizeEmail(email)) ?? null,
  };
}

export function createMemoryAuthAdmin(deletedUserIds: Set<string>): AuthAdminPort {
  return {
    async deleteAuthUser(userId) {
      deletedUserIds.add(userId);
    },
  };
}

export function createMemoryDeletionRequestStore(): DeletionRequestStore & {
  list: () => DeletionRequestRecord[];
} {
  const rows: DeletionRequestRecord[] = [];
  return {
    async enqueue({ email, userId, status }) {
      const row: DeletionRequestRecord = {
        id: randomUUID(),
        email: normalizeEmail(email),
        userId,
        createdAt: new Date().toISOString(),
        status,
      };
      rows.push(row);
      return row;
    },
    async hasRecent(email, sinceIso) {
      const normalized = normalizeEmail(email);
      return rows.some((row) => row.email === normalized && row.createdAt >= sinceIso);
    },
    list: () => [...rows],
  };
}

export function registerMemoryEmail(
  index: Map<string, string>,
  email: string,
  userId: string,
): void {
  index.set(normalizeEmail(email), userId);
}

async function exportForUser(
  deps: MemoryAccountDeps,
  userId: string,
  email: string | null,
): Promise<AccountExportPayload | null> {
  const profile = await deps.profiles.findByUserId(userId);
  if (!profile) {
    return null;
  }
  const [entitlement, quota, scans, routineSteps, consents] = await Promise.all([
    deps.entitlements.findByUserId(userId),
    deps.quota.getStatus(userId),
    deps.scans.listByUserId(userId),
    deps.routine.listSteps(userId),
    deps.consents.listByUserId(userId),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    userId,
    email: email ?? findEmail(deps.emailIndex, userId),
    profile,
    settings: {
      notifyScanReminders: profile.notifyScanReminders,
      notifyProductUpdates: profile.notifyProductUpdates,
    },
    entitlement,
    quota,
    scans,
    routineSteps,
    consents,
  };
}

async function purgeUserData(deps: MemoryAccountDeps, userId: string): Promise<boolean> {
  const profile = await deps.profiles.findByUserId(userId);
  const entitlement = await deps.entitlements.findByUserId(userId);
  const scanCount = (await deps.scans.listByUserId(userId)).length;
  const steps = await deps.routine.listSteps(userId);
  const consents = await deps.consents.listByUserId(userId);
  if (!profile && !entitlement && scanCount === 0 && steps.length === 0 && consents.length === 0) {
    return false;
  }
  await deps.scans.deleteAllForUser(userId);
  await deps.routine.deleteAllForUser(userId);
  await deps.consents.deleteAllForUser(userId);
  await deps.entitlements.deleteByUserId?.(userId);
  await deps.quota.deleteByUserId?.(userId);
  await deps.profiles.deleteByUserId(userId);
  removeEmail(deps.emailIndex, userId);
  return true;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function findEmail(index: Map<string, string>, userId: string): string | null {
  for (const [email, id] of index) {
    if (id === userId) {
      return email;
    }
  }
  return null;
}

function removeEmail(index: Map<string, string>, userId: string): void {
  for (const [email, id] of [...index.entries()]) {
    if (id === userId) {
      index.delete(email);
    }
  }
}
