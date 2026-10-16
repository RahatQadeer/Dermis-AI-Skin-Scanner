import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { displayNameFromEmailLocal, resolveAccountDisplayName } from './accountDisplayName';

describe('accountDisplayName', () => {
  it('uses signup full name only', () => {
    assert.equal(
      resolveAccountDisplayName({
        firstName: 'Rahat Kadir',
        email: 'rahatkadir.bhatti@gmail.com',
      }),
      'Rahat Kadir',
    );
  });

  it('does not fall back to email', () => {
    assert.equal(
      resolveAccountDisplayName({ email: 'rahatkadir.bhatti@gmail.com' }),
      null,
    );
  });

  it('formats email local-part helper when needed elsewhere', () => {
    assert.equal(displayNameFromEmailLocal('rahatkadir.bhatti'), 'Rahatkadir Bhatti');
    assert.equal(displayNameFromEmailLocal('maya_rose+test'), 'Maya Rose');
  });
});
