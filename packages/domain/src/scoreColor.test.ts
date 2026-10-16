import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { scoreColor } from './scoreColor';

describe('scoreColor', () => {
  it('returns green at 75 and above', () => {
    assert.equal(scoreColor(75), 'green');
    assert.equal(scoreColor(100), 'green');
  });

  it('returns sky for mid band', () => {
    assert.equal(scoreColor(60), 'sky');
    assert.equal(scoreColor(74), 'sky');
  });

  it('returns amber below 60', () => {
    assert.equal(scoreColor(59), 'amber');
    assert.equal(scoreColor(0), 'amber');
  });

  it('falls back to amber for non-finite', () => {
    assert.equal(scoreColor(Number.NaN), 'amber');
  });
});
