import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isPasswordAcceptable, passwordStrength } from './passwordStrength';

describe('passwordStrength', () => {
  it('scores empty as weak', () => {
    const result = passwordStrength('');
    assert.equal(result.score, 0);
    assert.equal(result.label, 'weak');
  });

  it('requires length and character classes for acceptable', () => {
    assert.equal(isPasswordAcceptable('short'), false);
    assert.equal(isPasswordAcceptable('longenough'), false);
    assert.equal(isPasswordAcceptable('Longenough1'), true);
  });

  it('reaches strong when all checks pass', () => {
    const result = passwordStrength('Longenough1!');
    assert.equal(result.score, 4);
    assert.equal(result.label, 'strong');
    assert.equal(result.checks.symbol, true);
  });

  it('labels fair and good by score', () => {
    assert.equal(passwordStrength('abcdefgh').label, 'fair'); // length + lower
    assert.equal(passwordStrength('Abcdefgh').label, 'good'); // + upper
  });
});
