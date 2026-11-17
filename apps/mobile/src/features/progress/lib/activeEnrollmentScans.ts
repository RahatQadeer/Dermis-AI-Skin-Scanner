import type { ProgressScan } from '../types/progressTypes';

/**
 * Newest-first scans for the active (most recent) face series only.
 * Trend cards should not mix different faces' skin records.
 */
export function activeEnrollmentScans(scansNewestFirst: readonly ProgressScan[]): ProgressScan[] {
  if (scansNewestFirst.length === 0) {
    return [];
  }
  const activeId = scansNewestFirst[0]!.faceEnrollmentId;
  return scansNewestFirst.filter((scan) => (scan.faceEnrollmentId ?? null) === (activeId ?? null));
}
