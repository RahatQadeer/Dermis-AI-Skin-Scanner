import assert from 'node:assert/strict';
import test from 'node:test';

import { mapGoTrueError } from './goTrueShared';

test('mapGoTrueError maps nonce mismatch distinctly from invalid credentials', () => {
  const err = mapGoTrueError(400, { error: 'invalid_grant', error_description: 'Nonces mismatch' });
  assert.equal(err.status, 401);
  assert.equal(err.code, 'auth_nonce_mismatch');
});

test('mapGoTrueError maps invalid login credentials', () => {
  const err = mapGoTrueError(400, { error_description: 'Invalid login credentials' });
  assert.equal(err.status, 401);
  assert.equal(err.code, 'invalid_credentials');
});

test('mapGoTrueError does not treat bare HTTP 400 as invalid_credentials', () => {
  const err = mapGoTrueError(400, {
    error: 'invalid_request',
    error_description: 'Unacceptable audience',
  });
  assert.equal(err.code, 'auth_provider_error');
});
