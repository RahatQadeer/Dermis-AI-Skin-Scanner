import { CONCERN_IDS, type ConcernId } from './concerns';
import { DEFAULT_WEIGHT } from './constants';

/**
 * index = round(sum(weight × score) / sum(weight)) — the single Skin Health
 * Index formula. Server scoring (calculateIndex) and app-side progress
 * comparisons both use it.
 *
 * Display use: re-scoring stored concern scores with one shared weight set
 * keeps a progress series comparable after the user changes their priority
 * concerns (each scan otherwise carries the weights in force when it was taken).
 * Missing weights fall back to DEFAULT_WEIGHT.
 */
export function weightedIndex(
  scores: Readonly<Record<ConcernId, number>>,
  weights: Readonly<Partial<Record<string, number>>>,
): number {
  let weightedSum = 0;
  let weightSum = 0;
  for (const id of CONCERN_IDS) {
    const weight = weights[id] ?? DEFAULT_WEIGHT;
    weightedSum += weight * scores[id];
    weightSum += weight;
  }
  return Math.round(weightedSum / weightSum);
}
