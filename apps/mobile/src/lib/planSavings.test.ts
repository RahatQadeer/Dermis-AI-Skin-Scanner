import assert from 'node:assert/strict';
import test from 'node:test';

import { computeSavingsPercent } from './planSavings';

test('computeSavingsPercent matches prototype reference (~58%)', () => {
  const percent = computeSavingsPercent(49.99, 9.99);
  assert.ok(percent !== null);
  assert.equal(percent, 58);
});

test('returns null when annual is not cheaper than 12× monthly', () => {
  assert.equal(computeSavingsPercent(120, 9.99), null);
  assert.equal(computeSavingsPercent(Number.NaN, 9.99), null);
});
