import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveMemoryWebhookSecret } from './memoryBackend.ts';
import {
  createScanBodySchema,
  MAX_SCAN_IMAGE_BASE64_CHARS,
  MAX_SCAN_IMAGE_BYTES,
} from './schemas/createScan.ts';

describe('security audit (DERM-068)', () => {
  it('scan imageBase64 rejects oversized payloads before decode', () => {
    const tooLong = 'a'.repeat(MAX_SCAN_IMAGE_BASE64_CHARS + 1);
    const result = createScanBodySchema.safeParse({
      idempotencyKey: 'abcdefgh',
      imageBase64: tooLong,
    });
    assert.equal(result.success, false);
    assert.ok(MAX_SCAN_IMAGE_BASE64_CHARS > MAX_SCAN_IMAGE_BYTES);
  });

  it('memory webhook secret refuses production default', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      assert.throws(() => resolveMemoryWebhookSecret(undefined), /REVENUECAT_WEBHOOK_SECRET/);
      assert.equal(resolveMemoryWebhookSecret('prod-secret-value'), 'prod-secret-value');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('memory webhook secret allows local default outside production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    try {
      assert.equal(resolveMemoryWebhookSecret(undefined), 'dev-revenuecat-webhook-secret');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
