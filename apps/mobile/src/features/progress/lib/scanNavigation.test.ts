import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { adjacentScanIds, indexDelta } from './scanNavigation';
import type { ProgressScan } from '../types/progressTypes';

const scores = {
  redness: 70,
  fineLines: 70,
  hydration: 70,
  darkSpots: 70,
  texture: 70,
  pores: 70,
};

function scan(id: string): ProgressScan {
  return {
    id,
    capturedAt: '2026-01-01',
    capturedTime: '08:00',
    scanNumber: 1,
    indexScore: 70,
    concernScores: scores,
  };
}

describe('scanNavigation', () => {
  const list = [scan('new'), scan('mid'), scan('old')];

  it('maps previous/next for middle scan', () => {
    assert.deepEqual(adjacentScanIds(list, 'mid'), {
      previousId: 'old',
      nextId: 'new',
    });
  });

  it('returns nulls at edges', () => {
    assert.deepEqual(adjacentScanIds(list, 'new'), {
      previousId: 'mid',
      nextId: null,
    });
    assert.deepEqual(adjacentScanIds(list, 'old'), {
      previousId: null,
      nextId: 'mid',
    });
  });

  it('computes index delta', () => {
    assert.equal(indexDelta(72, 68), 4);
    assert.equal(indexDelta(70, undefined), null);
  });
});
