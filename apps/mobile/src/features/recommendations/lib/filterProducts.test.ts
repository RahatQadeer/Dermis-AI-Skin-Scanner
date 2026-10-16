import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { filterProducts } from './filterProducts';
import type { PlaceholderProduct } from '../types/productTypes';

const sample: PlaceholderProduct[] = [
  {
    id: 'a',
    category: 'Serum',
    name: 'A',
    summary: 's',
    primaryConcern: 'redness',
    score: 50,
    priceLabel: '$10',
    concernIds: ['redness', 'hydration'],
  },
  {
    id: 'b',
    category: 'Exfoliant',
    name: 'B',
    summary: 's',
    primaryConcern: 'pores',
    score: 60,
    priceLabel: '$20',
    concernIds: ['pores'],
  },
];

describe('filterProducts', () => {
  it('returns all when filter is all', () => {
    assert.equal(filterProducts(sample, 'all').length, 2);
  });

  it('filters by concern id', () => {
    const result = filterProducts(sample, 'pores');
    assert.deepEqual(
      result.map((p) => p.id),
      ['b'],
    );
  });
});
