import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstNameFromAppleFullName,
  isAppleCancelError,
  trimAppleIdentityToken,
} from './appleAuthHelpers';

describe('appleAuthHelpers', () => {
  it('builds first name from Apple fullName parts', () => {
    assert.equal(
      firstNameFromAppleFullName({
        givenName: 'Ada',
        middleName: null,
        familyName: 'Lovelace',
      }),
      'Ada Lovelace',
    );
    assert.equal(firstNameFromAppleFullName(null), undefined);
    assert.equal(firstNameFromAppleFullName({ givenName: '  ', familyName: null }), undefined);
  });

  it('treats Apple cancel codes as non-errors', () => {
    assert.equal(isAppleCancelError({ code: 'ERR_REQUEST_CANCELED' }), true);
    assert.equal(isAppleCancelError({ code: 'ERR_CANCELED' }), true);
    assert.equal(isAppleCancelError({ code: 'other' }), false);
    assert.equal(isAppleCancelError(null), false);
  });

  it('trims or rejects identity tokens', () => {
    assert.equal(trimAppleIdentityToken(null), undefined);
    assert.equal(trimAppleIdentityToken('   '), undefined);
    assert.equal(trimAppleIdentityToken('  apple.jwt  '), 'apple.jwt');
  });
});
