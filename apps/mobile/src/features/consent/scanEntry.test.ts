import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { scanEntryHref } from './scanEntry';

describe('scanEntryHref', () => {
  it('routes to camera when consented', () => {
    assert.equal(scanEntryHref(true), '/(scan)/camera');
  });

  it('routes to AI consent when not consented', () => {
    assert.equal(scanEntryHref(false), '/(scan)/ai-consent');
  });
});
