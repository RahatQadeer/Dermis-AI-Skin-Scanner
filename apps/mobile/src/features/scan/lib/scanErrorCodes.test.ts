import assert from 'node:assert/strict';
import test from 'node:test';

import { scanConsentCopy } from '@/src/copy/screens/scanConsent';
import { ApiError } from '@/src/lib/api/errors';

import {
  isRetakeScanCode,
  isSameKeyRetryable,
  isUpgradeScanError,
  scanMessageKey,
} from './scanErrorCodes';

test('each failure class gets its own message', () => {
  assert.equal(scanMessageKey('scan_pipeline_disabled'), 'serviceUnavailable');
  assert.equal(scanMessageKey('quota_unavailable'), 'serviceUnavailable');
  assert.equal(scanMessageKey('network_unreachable'), 'networkUnreachable');
  assert.equal(scanMessageKey('image_too_large'), 'imageInvalid');
  assert.equal(scanMessageKey('analyzer_failed'), 'analyzerFailed');
  assert.equal(scanMessageKey('daily_limit'), 'dailyLimit');
  assert.equal(scanMessageKey('something_new'), undefined);
});

test('no developer wording reaches users', () => {
  assert.doesNotMatch(scanConsentCopy.dailyLimit, /unlock|testing/i);
});

test('only transient failures retry with the same idempotency key', () => {
  assert.equal(isSameKeyRetryable(new ApiError(0, 'network_timeout')), true);
  assert.equal(isSameKeyRetryable(new ApiError(504, 'analyzer_timeout')), true);
  assert.equal(isSameKeyRetryable(new ApiError(422, 'no_face')), false);
  assert.equal(isSameKeyRetryable(new ApiError(402, 'free_limit')), false);
});

test('free limit routes to upgrade; image problems route to retake', () => {
  assert.equal(isUpgradeScanError(new ApiError(402, 'free_limit')), true);
  assert.equal(isUpgradeScanError(new ApiError(402, 'daily_limit')), false);
  assert.equal(isRetakeScanCode('image_too_small'), true);
  assert.equal(isRetakeScanCode('consent_required'), false);
});
