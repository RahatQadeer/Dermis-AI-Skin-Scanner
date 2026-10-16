import assert from 'node:assert/strict';
import test from 'node:test';

import {
  base64DecodedByteLength,
  isWithinScanSizeLimit,
  MAX_SCAN_IMAGE_BYTES,
} from './scanImageLimits';

test('base64DecodedByteLength matches buffer length', () => {
  const raw = Buffer.alloc(100, 1);
  const b64 = raw.toString('base64');
  assert.equal(base64DecodedByteLength(b64), 100);
});

test('isWithinScanSizeLimit rejects oversized payload', () => {
  const big = Buffer.alloc(MAX_SCAN_IMAGE_BYTES + 1, 2).toString('base64');
  assert.equal(isWithinScanSizeLimit(big), false);
});
