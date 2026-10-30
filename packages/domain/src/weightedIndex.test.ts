import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateIndex } from './calculateIndex';
import type { ConcernScores } from './calculateIndex';
import { weightedIndex } from './weightedIndex';

const scores: ConcernScores = {
  redness: 40,
  fineLines: 80,
  hydration: 80,
  darkSpots: 80,
  texture: 80,
  pores: 80,
};

describe('weightedIndex', () => {
  it('matches calculateIndex for the same weights', () => {
    const scored = calculateIndex({ scores, priorities: ['redness'] });
    assert.equal(weightedIndex(scores, scored.weights), scored.index);
  });

  it('re-scores a scan under different priorities', () => {
    const asTaken = calculateIndex({ scores, priorities: ['redness'] });
    const unweighted = calculateIndex({ scores });
    assert.notEqual(asTaken.index, unweighted.index);
    assert.equal(weightedIndex(scores, unweighted.weights), unweighted.index);
  });

  it('treats missing weights as default weight', () => {
    assert.equal(weightedIndex(scores, {}), calculateIndex({ scores }).index);
  });
});
