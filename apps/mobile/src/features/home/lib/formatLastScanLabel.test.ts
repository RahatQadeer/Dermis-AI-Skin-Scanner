import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calendarDaysSinceScan, formatLastScanLabel } from './formatLastScanLabel';

const copy = {
  lastScanToday: 'Last scan today',
  lastScanYesterday: 'Last scan yesterday',
  lastScanDaysAgo: (n: number) => `Last scan ${String(n)} days ago`,
  lastScanUnknown: 'Last scan',
};

describe('formatLastScanLabel', () => {
  it('labels today / yesterday / N days in local calendar days', () => {
    const now = new Date(2026, 9, 19, 12, 47, 0); // 19 Oct 2026 local
    assert.equal(
      formatLastScanLabel(new Date(2026, 9, 19, 9, 0, 0).toISOString(), copy, now),
      'Last scan today',
    );
    assert.equal(
      formatLastScanLabel(new Date(2026, 9, 18, 23, 30, 0).toISOString(), copy, now),
      'Last scan yesterday',
    );
    assert.equal(
      formatLastScanLabel(new Date(2026, 9, 16, 8, 0, 0).toISOString(), copy, now),
      'Last scan 3 days ago',
    );
  });

  it('returns unknown for bad timestamps', () => {
    assert.equal(formatLastScanLabel('not-a-date', copy), 'Last scan');
    assert.equal(formatLastScanLabel(undefined, copy), 'Last scan');
  });

  it('counts calendar days, not 24h buckets', () => {
    const now = new Date(2026, 9, 19, 1, 0, 0);
    const lateYesterday = new Date(2026, 9, 18, 23, 0, 0);
    assert.equal(calendarDaysSinceScan(lateYesterday.toISOString(), now), 1);
  });
});
