import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deltaColor } from './deltaColor';

describe('deltaColor', () => {
  it('maps positive to green', () => {
    assert.equal(deltaColor(1), 'green');
    assert.equal(deltaColor(12), 'green');
  });

  it('maps negative to red', () => {
    assert.equal(deltaColor(-1), 'red');
  });

  it('maps zero and non-finite to mute', () => {
    assert.equal(deltaColor(0), 'mute');
    assert.equal(deltaColor(Number.NaN), 'mute');
  });
});
