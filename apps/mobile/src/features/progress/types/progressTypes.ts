import type { ConcernId } from '@dermis/domain';

export type ProgressWindow = '30' | '90';

export type ProgressScan = {
  id: string;
  /** UTC calendar date (YYYY-MM-DD) from the scan's takenAt. */
  capturedAt: string;
  /** Local time HH:mm for history rows (prototype). */
  capturedTime: string;
  /** 1-based scan sequence (001 = baseline). */
  scanNumber: number;
  indexScore: number;
  concernScores: Record<ConcernId, number>;
};
