import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { initialHysteresisState, nextHysteresis } from './livePreviewHysteresis';

describe('livePreviewHysteresis', () => {
  it('needs two OK samples before ready', () => {
    let s = initialHysteresisState();
    s = nextHysteresis(s, true, null);
    assert.equal(s.ready, false);
    assert.equal(s.issue, null);
    s = nextHysteresis(s, true, null);
    assert.equal(s.ready, true);
    assert.equal(s.issue, null);
  });

  it('updates tip immediately and drops ready after two failures', () => {
    let s = nextHysteresis(nextHysteresis(initialHysteresisState(), true, null), true, null);
    assert.equal(s.ready, true);
    s = nextHysteresis(s, false, 'no_face');
    assert.equal(s.ready, true);
    assert.equal(s.issue, 'no_face');
    s = nextHysteresis(s, false, 'too_far');
    assert.equal(s.ready, false);
    assert.equal(s.issue, 'too_far');
  });

  it('clears tip on the first OK sample', () => {
    let s = nextHysteresis(initialHysteresisState(), false, 'too_dark');
    assert.equal(s.issue, 'too_dark');
    s = nextHysteresis(s, true, null);
    assert.equal(s.issue, null);
  });
});
