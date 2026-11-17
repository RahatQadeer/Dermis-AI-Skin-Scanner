import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decideAutoCapture } from './autoCaptureWhenReady';

describe('decideAutoCapture', () => {
  it('starts once when ready and idle', () => {
    assert.equal(
      decideAutoCapture({
        ready: true,
        capturing: false,
        countdownActive: false,
        didAuto: false,
      }),
      'start',
    );
  });

  it('does not cancel an active countdown when ready flickers', () => {
    assert.equal(
      decideAutoCapture({
        ready: false,
        capturing: false,
        countdownActive: true,
        didAuto: true,
      }),
      'idle',
    );
  });

  it('resets latch while capturing so a retry can auto-start', () => {
    assert.equal(
      decideAutoCapture({
        ready: true,
        capturing: true,
        countdownActive: false,
        didAuto: true,
      }),
      'reset_latch',
    );
  });

  it('stays idle when not ready and no countdown', () => {
    assert.equal(
      decideAutoCapture({
        ready: false,
        capturing: false,
        countdownActive: false,
        didAuto: false,
      }),
      'idle',
    );
  });
});
