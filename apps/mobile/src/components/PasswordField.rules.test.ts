import assert from 'node:assert/strict';
import test from 'node:test';

import { passwordStrength } from '@dermis/domain';

test('PasswordField domain rule: Longenough1 is acceptable without symbol', () => {
  const result = passwordStrength('Longenough1');
  assert.equal(result.checks.symbol, false);
  assert.equal(result.checks.minLength, true);
  assert.equal(result.checks.upper, true);
  assert.equal(result.checks.lower, true);
  assert.equal(result.checks.number, true);
  assert.ok(result.score >= 3);
});

test('PasswordField domain rule: short password fails length', () => {
  const result = passwordStrength('Ab1');
  assert.equal(result.checks.minLength, false);
});
