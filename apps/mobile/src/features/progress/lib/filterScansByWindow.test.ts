import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { filterScansByWindow } from './filterScansByWindow';
import type { ProgressScan } from '../types/progressTypes';

const scores = {
  redness: 70,
  fineLines: 70,
  hydration: 70,
  darkSpots: 70,
  texture: 70,
  pores: 70,
};

function scan(id: string, capturedAt: string, indexScore = 70): ProgressScan {
  return {
    id,
    capturedAt,
    capturedTime: '08:00',
    scanNumber: 1,
    indexScore,
    concernScores: scores,
  };
}

describe('filterScansByWindow', () => {
  const now = new Date('2026-10-05T15:00:00.000Z');
  const all = [
    scan('a', '2026-10-05'),
    scan('b', '2026-09-20'),
    scan('c', '2026-08-01'),
    scan('d', '2026-07-01'),
  ];

  it('keeps scans in 30-day window newest first', () => {
    const filtered = filterScansByWindow(all, '30', now);
    assert.deepEqual(
      filtered.map((s) => s.id),
      ['a', 'b'],
    );
  });

  it('keeps scans in 90-day window', () => {
    const filtered = filterScansByWindow(all, '90', now);
    assert.deepEqual(
      filtered.map((s) => s.id),
      ['a', 'b', 'c'],
    );
  });
});
