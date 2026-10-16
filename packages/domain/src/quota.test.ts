import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { canConsumeScan, remainingScans } from './quota';

describe('quota', () => {
  it('allows free user with no scans used', () => {
    const decision = canConsumeScan({
      plan: 'free',
      lifetimeScanCount: 0,
      dailyScanCount: 0,
    });
    assert.deepEqual(decision, { allowed: true, remaining: 1 });
  });

  it('blocks free user after one scan', () => {
    const decision = canConsumeScan({
      plan: 'free',
      lifetimeScanCount: 1,
      dailyScanCount: 0,
    });
    assert.equal(decision.allowed, false);
    if (!decision.allowed) {
      assert.equal(decision.reason, 'free_limit');
    }
  });

  it('allows pro under daily limit', () => {
    const decision = canConsumeScan({
      plan: 'pro',
      lifetimeScanCount: 40,
      dailyScanCount: 2,
    });
    assert.deepEqual(decision, { allowed: true, remaining: 3 });
  });

  it('blocks pro at five scans today', () => {
    const decision = canConsumeScan({
      plan: 'pro',
      lifetimeScanCount: 40,
      dailyScanCount: 5,
    });
    assert.equal(decision.allowed, false);
    if (!decision.allowed) {
      assert.equal(decision.reason, 'daily_limit');
    }
  });

  it('remainingScans mirrors decision', () => {
    assert.equal(remainingScans({ plan: 'pro', lifetimeScanCount: 0, dailyScanCount: 4 }), 1);
  });
});
