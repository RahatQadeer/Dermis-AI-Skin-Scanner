import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildQuotaRowView } from './homeQuotaCopy';

const copy = {
  planFree: 'Free',
  planPro: 'Pro',
  scansRemainingFree: (n: number) => `${String(n)} free left`,
  scansRemainingPro: (n: number) => `${String(n)} today`,
  quotaLimitFree: 'free cap',
  quotaLimitPro: 'daily cap',
};

describe('buildQuotaRowView', () => {
  it('shows remaining free scan', () => {
    const view = buildQuotaRowView({ plan: 'free', lifetimeScanCount: 0, dailyScanCount: 0 }, copy);
    assert.equal(view.planLabel, 'Free');
    assert.equal(view.scanLine, '1 free left');
    assert.equal(view.atLimit, false);
  });

  it('shows free limit', () => {
    const view = buildQuotaRowView({ plan: 'free', lifetimeScanCount: 1, dailyScanCount: 0 }, copy);
    assert.equal(view.atLimit, true);
    assert.equal(view.scanLine, 'free cap');
  });

  it('shows pro daily limit', () => {
    const view = buildQuotaRowView({ plan: 'pro', lifetimeScanCount: 0, dailyScanCount: 5 }, copy);
    assert.equal(view.planLabel, 'Pro');
    assert.equal(view.atLimit, true);
    assert.equal(view.scanLine, 'daily cap');
  });
});
