import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { initialCountdownDisplay, nextCountdownTick } from './countdownLogic';

describe('countdownLogic', () => {
  it('starts at from', () => {
    assert.equal(initialCountdownDisplay(3), 3);
  });

  it('ticks 3 → 2 → 1 → done', () => {
    assert.deepEqual(nextCountdownTick(3), { display: 2, done: false });
    assert.deepEqual(nextCountdownTick(2), { display: 1, done: false });
    assert.deepEqual(nextCountdownTick(1), { display: null, done: true });
  });
});
