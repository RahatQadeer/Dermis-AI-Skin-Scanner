import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasFieldErrors,
  isValidEmail,
  validateForgotEmail,
  validateLogInFields,
  validateSignUpFields,
} from './authValidation';

test('isValidEmail rejects obvious invalid addresses', () => {
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail('a@b.co'), true);
  assert.equal(isValidEmail('not-an-email'), false);
});

test('validateSignUpFields requires a first name, valid email and acceptable password', () => {
  const missingName = validateSignUpFields('', 'user@example.com', 'Longenough1');
  assert.equal(missingName.name, 'nameRequired');
  const weak = validateSignUpFields('Maya', 'user@example.com', 'short');
  assert.equal(weak.password, 'passwordWeak');
  const badEmail = validateSignUpFields('Maya', 'nope', 'Longenough1');
  assert.equal(badEmail.email, 'emailInvalid');
  const ok = validateSignUpFields('Maya', 'user@example.com', 'Longenough1');
  assert.equal(hasFieldErrors(ok), false);
});

test('validateLogInFields requires email and a password', () => {
  assert.equal(validateLogInFields('bad', 'x').email, 'emailInvalid');
  assert.equal(validateLogInFields('ok@example.com', '').password, 'passwordTooShort');
  assert.equal(hasFieldErrors(validateLogInFields('ok@example.com', 'pw')), false);
});

test('validateForgotEmail requires email', () => {
  assert.equal(validateForgotEmail('bad').email, 'emailInvalid');
  assert.equal(hasFieldErrors(validateForgotEmail('ok@example.com')), false);
});
