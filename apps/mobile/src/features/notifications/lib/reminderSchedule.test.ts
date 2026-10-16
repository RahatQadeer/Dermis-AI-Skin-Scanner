import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isValidWeekday, weeklyScanReminderTrigger } from './reminderSchedule';

describe('reminderSchedule', () => {
  it('returns Monday 10:00 local defaults', () => {
    assert.deepEqual(weeklyScanReminderTrigger(), { weekday: 2, hour: 10, minute: 0 });
  });

  it('validates weekday range', () => {
    assert.equal(isValidWeekday(1), true);
    assert.equal(isValidWeekday(7), true);
    assert.equal(isValidWeekday(0), false);
    assert.equal(isValidWeekday(8), false);
  });
});
