import type { ProgressScan, ProgressWindow } from '../types/progressTypes';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function windowDayCount(window: ProgressWindow): number {
  return window === '30' ? 30 : 90;
}

/** Inclusive window ending at `now` (UTC day of `now`). Newest-first order. */
export function filterScansByWindow(
  scans: readonly ProgressScan[],
  window: ProgressWindow,
  now: Date = new Date(),
): ProgressScan[] {
  const days = windowDayCount(window);
  const end = startOfUtcDay(now).getTime() + MS_PER_DAY - 1;
  const start = startOfUtcDay(now).getTime() - (days - 1) * MS_PER_DAY;

  return scans
    .filter((scan) => {
      const t = Date.parse(`${scan.capturedAt}T12:00:00.000Z`);
      return Number.isFinite(t) && t >= start && t <= end;
    })
    .slice()
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
