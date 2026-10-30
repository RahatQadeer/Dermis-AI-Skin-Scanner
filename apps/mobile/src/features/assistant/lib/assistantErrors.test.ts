import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError } from '@/src/lib/api/errors';

import { assistantErrorKey } from './assistantErrors';

test('maps assistant failures to specific messages', () => {
  assert.equal(assistantErrorKey(new ApiError(429, 'assistant_daily_limit')), 'errorDailyLimit');
  assert.equal(assistantErrorKey(new ApiError(0, 'network_unreachable')), 'errorOffline');
  assert.equal(
    assistantErrorKey(new ApiError(503, 'assistant_not_configured')),
    'errorNotConfigured',
  );
  assert.equal(assistantErrorKey(new ApiError(502, 'assistant_unavailable')), 'errorUnavailable');
  assert.equal(assistantErrorKey(new Error('boom')), 'errorUnavailable');
});
