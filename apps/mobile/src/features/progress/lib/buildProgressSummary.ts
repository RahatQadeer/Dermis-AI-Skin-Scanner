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
  concernChanges: ConcernChange[];
};

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
  const concernChanges = CONCERN_ORDER.map((id) => {
    const before = oldest.concernScores[id];
    const after = newest.concernScores[id];
    return { id, before, after, delta: after - before };
  });

  return {
    current: newest.indexScore,
    baseline: oldest.indexScore,
    delta: newest.indexScore - oldest.indexScore,
    values: chronological.map((scan) => scan.indexScore),
    startDate: oldest.capturedAt,
    concernChanges,
  };
}
