import assert from 'node:assert/strict';
import test from 'node:test';

import { EMPTY_OWNED, readOwned, readOwnedScan } from './scanCaptureOwnership';

test('readOwned returns the value for the user that wrote it', () => {
  assert.equal(readOwned({ ownerId: 'a', value: 'photo' }, 'a'), 'photo');
});

test('readOwned hides the value after an account switch or logout', () => {
  assert.equal(readOwned({ ownerId: 'a', value: 'photo' }, 'b'), null);
  assert.equal(readOwned({ ownerId: 'a', value: 'photo' }, null), null);
});

test('readOwned supports guest (null) sessions', () => {
  assert.equal(readOwned({ ownerId: null, value: 'photo' }, null), 'photo');
  assert.equal(readOwned(EMPTY_OWNED, null), null);
});

test('readOwnedScan rejects a scan record belonging to another user', () => {
  // Upload started by user a resolves after user b signed in.
  const scan = { id: 's1', userId: 'a' };
  assert.equal(readOwnedScan({ ownerId: 'b', value: scan }, 'b'), null);
  assert.equal(readOwnedScan({ ownerId: 'a', value: scan }, 'a'), scan);
});

test('readOwnedScan hides an upload that resolved after sign-out', () => {
  // Upload started by user a; session ended mid-flight, so the write is tagged null.
  const scan = { id: 's1', userId: 'a' };
  assert.equal(readOwnedScan({ ownerId: null, value: scan }, null), null);
});
