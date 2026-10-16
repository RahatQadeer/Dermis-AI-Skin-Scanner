import type { ConcernId } from '@dermis/domain';

import { colors } from '@/src/theme';

/** Display order for the 6-segment concern bar on history cards. */
export const SEGMENT_CONCERN_ORDER: readonly ConcernId[] = [
  'texture',
  'pores',
  'hydration',
  'redness',
  'fineLines',
  'darkSpots',
] as const;

/** Map a concern score to the prototype segment palette (green / sky / amber). */
export function segmentColorForScore(score: number): string {
  if (score >= 70) {
    return colors.green;
  }
  if (score >= 60) {
    return colors.sky;
  }
  return colors.amber;
}
