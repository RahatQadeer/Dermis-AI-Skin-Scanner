import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isElementUnlocked } from './gating';

describe('gating', () => {
  it('unlocks index and priority for free', () => {
    assert.equal(isElementUnlocked('free', 'overallIndex'), true);
    assert.equal(isElementUnlocked('free', 'priorityConcern'), true);
  });

  it('locks pro-only elements for free', () => {
    assert.equal(isElementUnlocked('free', 'zoneMap'), false);
    assert.equal(isElementUnlocked('free', 'otherConcerns'), false);
    assert.equal(isElementUnlocked('free', 'pdfExport'), false);
  });

  it('unlocks everything for pro', () => {
    assert.equal(isElementUnlocked('pro', 'zoneMap'), true);
    assert.equal(isElementUnlocked('pro', 'routine'), true);
  });

  it('unlocks everything when DERMIS_FORCE_PRO is set', () => {
    const prev = process.env.DERMIS_FORCE_PRO;
    process.env.DERMIS_FORCE_PRO = '1';
    try {
      assert.equal(isElementUnlocked('free', 'zoneMap'), true);
      assert.equal(isElementUnlocked('free', 'pdfExport'), true);
    } finally {
      if (prev === undefined) {
        delete process.env.DERMIS_FORCE_PRO;
      } else {
        process.env.DERMIS_FORCE_PRO = prev;
      }
    }
  });
});
