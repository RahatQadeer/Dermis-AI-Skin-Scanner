const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole local calendar days between the scan instant and `now`.
 * 0 = today, 1 = yesterday, etc. Returns null if `takenAt` is invalid.
 */
export function calendarDaysSinceScan(takenAt: string, now: Date = new Date()): number | null {
  const taken = new Date(takenAt);
  if (!Number.isFinite(taken.getTime())) {
    return null;
  }
  const startToday = startOfLocalDay(now);
  const startTaken = startOfLocalDay(taken);
  return Math.round((startToday.getTime() - startTaken.getTime()) / MS_PER_DAY);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type LastScanCopy = {
  lastScanToday: string;
  lastScanYesterday: string;
  lastScanDaysAgo: (n: number) => string;
  lastScanUnknown: string;
};

/** User-facing “Last scan …” from the real scan timestamp. */
export function formatLastScanLabel(
  takenAt: string | undefined,
  copy: LastScanCopy,
  now: Date = new Date(),
): string {
  if (!takenAt) {
    return copy.lastScanUnknown;
  }
  const days = calendarDaysSinceScan(takenAt, now);
  if (days === null || days < 0) {
    return copy.lastScanUnknown;
  }
  if (days === 0) {
    return copy.lastScanToday;
  }
  if (days === 1) {
    return copy.lastScanYesterday;
  }
  return copy.lastScanDaysAgo(days);
}
