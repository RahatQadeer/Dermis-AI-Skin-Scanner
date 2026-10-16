import type { ConcernScores } from './calculateIndex';
import { CONCERN_IDS, type ConcernId, isConcernId } from './concerns';

/**
 * Which concern the free tier may show beside the overall index.
 * - If the user picked quiz priorities: **first in selection order** (even when 3).
 * - If none: highest-scoring concern (ties → CONCERN_IDS order).
 */
export function resolveFreePreviewConcernId(
  scores: ConcernScores,
  priorities: readonly string[],
): ConcernId {
  for (const raw of priorities) {
    if (isConcernId(raw)) {
      return raw;
    }
  }

  let best: ConcernId = CONCERN_IDS[0];
  let bestScore = scores[best];
  for (const id of CONCERN_IDS) {
    const value = scores[id];
    if (
      value > bestScore ||
      (value === bestScore && CONCERN_IDS.indexOf(id) < CONCERN_IDS.indexOf(best))
    ) {
      best = id;
      bestScore = value;
    }
  }
  return best;
}
