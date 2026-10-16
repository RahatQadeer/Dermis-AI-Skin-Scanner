import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProgressSummary } from './buildProgressSummary';
import type { ProgressScan } from '../types/progressTypes';

function scan(id: string, date: string, index: number, redness: number): ProgressScan {
  return {
    id,
    capturedAt: date,
    capturedTime: '08:00',
    scanNumber: 1,
    indexScore: index,
    concernScores: {
      redness,
      fineLines: 70,
      hydration: 70,
      darkSpots: 65,
      texture: 70,
      pores: 67,
    },
  };
}

test('buildProgressSummary returns null for no scans', () => {
  assert.equal(buildProgressSummary([]), null);
});

test('buildProgressSummary derives current, baseline and delta from newest-first scans', () => {
  const summary = buildProgressSummary([
    scan('b', '2026-10-04', 72, 76),
    scan('a', '2026-08-20', 66, 70),
  ]);
  assert.ok(summary);
  assert.equal(summary.current, 72);
  assert.equal(summary.baseline, 66);
  assert.equal(summary.delta, 6);
  assert.deepEqual(summary.values, [66, 72]);
  assert.equal(summary.startDate, '2026-08-20');
  const redness = summary.concernChanges.find((c) => c.id === 'redness');
  assert.equal(redness?.delta, 6);
});
