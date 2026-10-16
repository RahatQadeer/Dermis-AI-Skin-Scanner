import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  progressAfterTick,
  stepIndexForProgress,
  waitingProgressAfterTick,
} from './analysingProgress';

describe('analysingProgress', () => {
  it('maps progress to step index', () => {
    assert.equal(stepIndexForProgress(0, 4), 0);
    assert.equal(stepIndexForProgress(25, 4), 1);
    assert.equal(stepIndexForProgress(99, 4), 3);
    assert.equal(stepIndexForProgress(100, 4), 3);
  });

  it('caps progress at 100', () => {
    assert.equal(progressAfterTick(95, 10), 100);
  });

  it('eases waiting progress toward 98 without freezing at 95', () => {
    assert.ok(waitingProgressAfterTick(94) > 94);
    assert.equal(waitingProgressAfterTick(98), 98);
    assert.equal(waitingProgressAfterTick(99), 98);
  });
});
