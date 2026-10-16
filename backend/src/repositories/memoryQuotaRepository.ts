import { canConsumeScan, resolveEffectivePlan, type Plan } from '@dermis/domain/server';

import type { QuotaConsumeResult, QuotaRepository, QuotaStatus } from './quotaTypes';

type UsageRow = {
  plan: Plan;
  lifetimeScanCount: number;
  dailyScanCount: number;
  dailyWindowDate: string | null;
};

/**
 * In-memory atomic quota. A per-user async mutex serializes consume() so
 * concurrent callers cannot oversell free (1) or pro daily (5) limits.
 */
export function createMemoryQuotaRepository(
  seed: Iterable<{ userId: string; plan?: Plan; lifetime?: number; daily?: number }> = [],
): QuotaRepository {
  const rows = new Map<string, UsageRow>();
  const locks = new Map<string, Promise<void>>();
  seedRows(rows, seed);

  return {
    async getStatus(userId) {
      ensureRow(rows, userId);
      return toStatus(rows.get(userId)!);
    },
    async setPlan(userId, plan) {
      const row = rows.get(userId) ?? emptyRow(plan);
      row.plan = plan;
      rows.set(userId, row);
    },
    async consume(userId) {
      return withLock(locks, userId, () => {
        ensureRow(rows, userId);
        return consumeLocked(rows, userId);
      });
    },
    async refund(userId) {
      return withLock(locks, userId, () => {
        refundLocked(rows, userId);
      });
    },
    async deleteByUserId(userId) {
      return rows.delete(userId);
    },
  };
}

function ensureRow(rows: Map<string, UsageRow>, userId: string): void {
  if (!rows.has(userId)) {
    rows.set(userId, emptyRow('free'));
  }
}

function seedRows(
  rows: Map<string, UsageRow>,
  seed: Iterable<{ userId: string; plan?: Plan; lifetime?: number; daily?: number }>,
): void {
  for (const item of seed) {
    rows.set(item.userId, {
      plan: item.plan ?? 'free',
      lifetimeScanCount: item.lifetime ?? 0,
      dailyScanCount: item.daily ?? 0,
      dailyWindowDate: utcDate(),
    });
  }
}

function consumeLocked(rows: Map<string, UsageRow>, userId: string): QuotaConsumeResult {
  const row = rows.get(userId);
  if (!row) {
    return { allowed: false, remaining: 0, reason: 'no_usage_row' };
  }
  resetDailyIfNeeded(row);
  const plan = resolveEffectivePlan(row.plan);
  const decision = canConsumeScan({
    plan,
    lifetimeScanCount: row.lifetimeScanCount,
    dailyScanCount: row.dailyScanCount,
  });
  if (!decision.allowed) {
    return { allowed: false, remaining: 0, reason: decision.reason };
  }
  row.lifetimeScanCount += 1;
  if (plan === 'pro') {
    row.dailyScanCount += 1;
    row.dailyWindowDate = utcDate();
  }
  rows.set(userId, row);
  return { allowed: true, remaining: decision.remaining - 1 };
}

function refundLocked(rows: Map<string, UsageRow>, userId: string): void {
  const row = rows.get(userId);
  if (!row || row.lifetimeScanCount <= 0) {
    return;
  }
  row.lifetimeScanCount -= 1;
  if (row.plan === 'pro' && row.dailyScanCount > 0) {
    row.dailyScanCount -= 1;
  }
  rows.set(userId, row);
}

function emptyRow(plan: Plan): UsageRow {
  return {
    plan,
    lifetimeScanCount: 0,
    dailyScanCount: 0,
    dailyWindowDate: utcDate(),
  };
}

function resetDailyIfNeeded(row: UsageRow): void {
  const today = utcDate();
  if (row.plan === 'pro' && row.dailyWindowDate !== today) {
    row.dailyScanCount = 0;
    row.dailyWindowDate = today;
  }
}

function toStatus(row: UsageRow): QuotaStatus {
  resetDailyIfNeeded(row);
  const decision = canConsumeScan({
    plan: row.plan,
    lifetimeScanCount: row.lifetimeScanCount,
    dailyScanCount: row.dailyScanCount,
  });
  return {
    plan: row.plan,
    lifetimeScanCount: row.lifetimeScanCount,
    dailyScanCount: row.dailyScanCount,
    dailyWindowDate: row.dailyWindowDate,
    remaining: decision.remaining,
  };
}

function utcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function withLock<T>(
  locks: Map<string, Promise<void>>,
  key: string,
  fn: () => T,
): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  locks.set(
    key,
    previous.then(() => gate),
  );
  await previous;
  try {
    return fn();
  } finally {
    release();
  }
}
