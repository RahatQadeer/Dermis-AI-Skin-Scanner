import assert from 'node:assert/strict';
import test from 'node:test';

import { defaultMotionForMood, MASCOT_MOODS } from './mascotTypes';

test('all six moods map to a motion kind', () => {
  assert.equal(MASCOT_MOODS.length, 6);
  for (const mood of MASCOT_MOODS) {
    const kind = defaultMotionForMood(mood);
    assert.ok(['bob', 'blink', 'hop', 'sway', 'none'].includes(kind));
  }
});

test('surprised uses hop', () => {
  assert.equal(defaultMotionForMood('surprised'), 'hop');
});

test('wink uses blink', () => {
  assert.equal(defaultMotionForMood('wink'), 'blink');
});
