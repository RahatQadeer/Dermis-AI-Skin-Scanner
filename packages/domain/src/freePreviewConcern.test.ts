import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ConcernScores } from './calculateIndex';
import { resolveFreePreviewConcernId } from './freePreviewConcern';

const scores: ConcernScores = {
  redness: 81,
  fineLines: 77,
  hydration: 72,
  darkSpots: 69,
  texture: 64,
  pores: 58,
};

describe('resolveFreePreviewConcernId', () => {
  it('uses first valid quiz priority when present', () => {
    assert.equal(resolveFreePreviewConcernId(scores, ['pores', 'texture']), 'pores');
  });

  it('falls back to highest score when no priorities', () => {
    assert.equal(resolveFreePreviewConcernId(scores, []), 'redness');
  });

  it('breaks ties by concern order', () => {
    const tied: ConcernScores = {
      redness: 70,
      fineLines: 70,
      hydration: 50,
      darkSpots: 50,
      texture: 50,
      pores: 50,
    };
    assert.equal(resolveFreePreviewConcernId(tied, []), 'redness');
    assert.equal(resolveFreePreviewConcernId(tied, ['hydration']), 'hydration');
  });

  it('ignores invalid priority ids when picking fallback path', () => {
    assert.equal(resolveFreePreviewConcernId(scores, ['not-a-concern']), 'redness');
  });
});
