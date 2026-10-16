import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ConcernId } from '@dermis/domain';

import { PLACEHOLDER_PRODUCTS } from '../mock/placeholderProducts';
import { rankProductsForScan } from './rankProductsForScan';

describe('rankProductsForScan', () => {
  it('prefers actives for the weakest concerns', () => {
    const scores = {
      redness: 90,
      fineLines: 88,
      hydration: 85,
      darkSpots: 80,
      texture: 70,
      pores: 40,
    } as Record<ConcernId, number>;
    const ranked = rankProductsForScan(PLACEHOLDER_PRODUCTS, scores, 2);
    assert.ok(ranked.length === 2);
    assert.ok(ranked[0]!.concernIds.includes('pores'));
  });
});
