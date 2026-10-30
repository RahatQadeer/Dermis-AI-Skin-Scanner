import type { ConcernId } from '@dermis/domain';

import type { ProgressScan } from '../types/progressTypes';

/** Concern display order (matches concernCopy). */
const CONCERN_ORDER: readonly ConcernId[] = [
  'redness',
  'fineLines',
  'hydration',
  'darkSpots',
  'texture',
  'pores',
];

export type ConcernChange = {
  id: ConcernId;
  before: number;
  after: number;
  delta: number;
};

export type ProgressSummary = {
  current: number;
  baseline: number;
  delta: number;
  /** Chronological (oldest → newest) index scores for the chart. */
  values: number[];
  startDate: string;
  /** Window baseline (oldest) → latest concern deltas. */
  concernChanges: ConcernChange[];
  /** Previous scan → latest (null when fewer than 2 scans). */
  previousVsLatest: {
    previousDate: string;
    previousScore: number;
    latestDate: string;
    latestScore: number;
    delta: number;
    concernChanges: ConcernChange[];
  } | null;
};

function concernChangesBetween(before: ProgressScan, after: ProgressScan): ConcernChange[] {
  return CONCERN_ORDER.map((id) => {
    const b = before.concernScores[id];
    const a = after.concernScores[id];
    return { id, before: b, after: a, delta: a - b };
  });
}

/** Derives the headline figures + chart series from newest-first scans. */
export function buildProgressSummary(
  scansNewestFirst: readonly ProgressScan[],
): ProgressSummary | null {
  if (scansNewestFirst.length === 0) {
    return null;
  }
  const chronological = [...scansNewestFirst].reverse();
  const oldest = chronological[0]!;
  const newest = chronological[chronological.length - 1]!;
  const previous =
    chronological.length >= 2 ? chronological[chronological.length - 2]! : null;

  return {
    current: newest.indexScore,
    baseline: oldest.indexScore,
    delta: newest.indexScore - oldest.indexScore,
    values: chronological.map((scan) => scan.indexScore),
    startDate: oldest.capturedAt,
    concernChanges: concernChangesBetween(oldest, newest),
    previousVsLatest: previous
      ? {
          previousDate: previous.capturedAt,
          previousScore: previous.indexScore,
          latestDate: newest.capturedAt,
          latestScore: newest.indexScore,
          delta: newest.indexScore - previous.indexScore,
          concernChanges: concernChangesBetween(previous, newest),
        }
      : null,
  };
}
