import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { paywallCopy } from './paywall';

/** PRODUCT.md D3 / store subscription disclosure strings that must stay present. */
const REQUIRED_DISCLOSURE_KEYS = [
  'title',
  'annualPlan',
  'monthlyPlan',
  'perYear',
  'perMonth',
  'trialNote',
  'trialTimeline',
  'autoRenews',
  'cancelHint',
  'chargeToAccount',
  'renewWindow',
  'restore',
  'terms',
  'privacy',
] as const;

describe('subscription disclosures (DERM-065)', () => {
  it('paywall copy includes required D3 disclosure fields', () => {
    for (const key of REQUIRED_DISCLOSURE_KEYS) {
      const value = paywallCopy[key];
      assert.equal(typeof value, 'string');
      assert.ok(String(value).trim().length > 0, `missing ${key}`);
    }
  });

  it('billing summaries include price and period', () => {
    assert.match(paywallCopy.billingSummaryAnnual('$49.99'), /per year/i);
    assert.match(paywallCopy.billingSummaryMonthly('$9.99'), /per month/i);
    assert.match(paywallCopy.billingSummaryAnnual('$49.99'), /\$49\.99/);
  });
});
