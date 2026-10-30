import { weightedIndex } from '@dermis/domain';

import type { ScanDto } from '../api/scanApi';

/**
 * Change in Skin Health Index from `previous` to `current`, with the previous
 * scan re-scored on the current scan's weights so a change of priority concerns
 * in the profile never shows up as a change in skin. Shared by Home, Results
 * and Progress so the same pair of scans always shows the same delta.
 */
export function indexDeltaSincePrevious(
  current: Pick<ScanDto, 'indexScore' | 'weights'>,
  previous: Pick<ScanDto, 'concerns'>,
): number {
  return current.indexScore - weightedIndex(previous.concerns, current.weights);
}
