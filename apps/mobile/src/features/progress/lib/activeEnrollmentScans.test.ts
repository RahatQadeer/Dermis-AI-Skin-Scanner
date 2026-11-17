import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { activeEnrollmentScans } from './activeEnrollmentScans';
import type { ProgressScan } from '../types/progressTypes';

function scan(id: string, enrollment: string | null): ProgressScan {
  return {
    id,
    capturedAt: '2026-11-01',
    capturedTime: '10:00',
    scanNumber: 1,
    indexScore: 70,
    concernScores: {
      redness: 70,
      fineLines: 70,
      hydration: 70,
      darkSpots: 70,
      texture: 70,
      pores: 70,
    },
    faceEnrollmentId: enrollment,
  };
}

describe('activeEnrollmentScans', () => {
  it('keeps only the newest face series', () => {
    const rows = [scan('c', 'face-2'), scan('b', 'face-2'), scan('a', 'face-1')];
    assert.deepEqual(
      activeEnrollmentScans(rows).map((s) => s.id),
      ['c', 'b'],
    );
  });
});
