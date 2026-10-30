import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError } from '@/src/lib/api/errors';

import { isRefreshRejected, isRefreshStillCurrent } from './refreshOutcome';

test('a rejected refresh token ends the session', () => {
  assert.equal(isRefreshRejected(new ApiError(401, 'invalid_credentials')), true);
  assert.equal(isRefreshRejected(new ApiError(400, 'invalid_grant')), true);
});

test('transient failures keep the session', () => {
  assert.equal(isRefreshRejected(new ApiError(0, 'network')), false);
  assert.equal(isRefreshRejected(new ApiError(429, 'rate_limited')), false);
  assert.equal(isRefreshRejected(new ApiError(503, 'unavailable')), false);
  assert.equal(isRefreshRejected(new Error('timeout')), false);
});

test('a refresh started before sign-out or an account switch is discarded', () => {
  assert.equal(isRefreshStillCurrent('rt-a', 'rt-a'), true);
  assert.equal(isRefreshStillCurrent('rt-a', null), false);
  assert.equal(isRefreshStillCurrent('rt-a', 'rt-b'), false);
});
