import assert from 'node:assert/strict';
import test from 'node:test';

import { createFakeSkinAnalyzer } from '../adapters/fakeSkinAnalyzer';
import { createMemoryPhotoStorage } from '../adapters/memoryPhotoStorage';
import { FACE_ANALYSIS_CONSENT_VERSION } from '../constants/consent';
import { HttpError } from '../http/HttpError';
import { createMemoryConsentRepository } from '../repositories/memoryConsentRepository';
import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createMemoryQuotaRepository } from '../repositories/memoryQuotaRepository';
import { createMemoryScanRepository } from '../repositories/memoryScanRepository';
import type { ScanRepository } from '../repositories/scanTypes';
import { createConsentService } from '../services/consentService';
import { createQuotaService } from '../services/quotaService';
import { createScanPipelineService } from '../services/scanPipelineService';

const USER = '55555555-5555-4555-8555-555555555555';
const IMAGE_B64 = Buffer.alloc(64, 7).toString('base64');

async function grantFaceConsent(consents: ReturnType<typeof createConsentService>): Promise<void> {
  await consents.applyGrant(USER, {
    type: 'face_analysis',
    version: FACE_ANALYSIS_CONSENT_VERSION,
    granted: true,
  });
}

function buildPipeline(overrides?: {
  failAnalyzer?: boolean;
  scans?: ScanRepository;
  photos?: ReturnType<typeof createMemoryPhotoStorage>;
}) {
  const photos = overrides?.photos ?? createMemoryPhotoStorage();
  const quotaRepo = createMemoryQuotaRepository([{ userId: USER, plan: 'free' }]);
  const quota = createQuotaService(quotaRepo);
  const scans = overrides?.scans ?? createMemoryScanRepository();
  const profiles = createMemoryProfileRepository();
  const consentRepo = createMemoryConsentRepository();
  const consents = createConsentService(consentRepo);
  const analyzer = createFakeSkinAnalyzer({ fail: overrides?.failAnalyzer });

  const pipeline = createScanPipelineService({
    scans,
    profiles,
    quota,
    consent: consents,
    analyzer,
    photos,
  });

  return { pipeline, quota, photos, scans, consents };
}

test('scan pipeline creates scan, consumes free quota, deletes photo', async () => {
  const { pipeline, quota, photos, consents } = buildPipeline();
  await grantFaceConsent(consents);
  const result = await pipeline.createScan({
    userId: USER,
    idempotencyKey: 'idem-key-0001',
    imageBase64: IMAGE_B64,
    contentType: 'image/jpeg',
  });

  assert.equal(result.replayed, false);
  assert.equal(result.scan.indexScore >= 0, true);
  assert.equal(photos.size(), 0);
  const status = await quota.getStatus(USER);
  assert.equal(status.lifetimeScanCount, 1);
  assert.equal(status.remaining, 0);
});

test('scan pipeline is idempotent for same key', async () => {
  const { pipeline, quota, consents } = buildPipeline();
  await grantFaceConsent(consents);
  const input = {
    userId: USER,
    idempotencyKey: 'idem-key-same',
    imageBase64: IMAGE_B64,
    contentType: 'image/jpeg' as const,
  };
  const first = await pipeline.createScan(input);
  const second = await pipeline.createScan(input);
  assert.equal(first.scan.id, second.scan.id);
  assert.equal(second.replayed, true);
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 1);
});

test('analyzer failure does not consume quota and cleans photo', async () => {
  const photos = createMemoryPhotoStorage();
  const { pipeline, quota, consents } = buildPipeline({ failAnalyzer: true, photos });
  await grantFaceConsent(consents);
  await assert.rejects(
    () =>
      pipeline.createScan({
        userId: USER,
        idempotencyKey: 'idem-fail-an',
        imageBase64: IMAGE_B64,
        contentType: 'image/jpeg',
      }),
    /analyzer_failed/,
  );
  assert.equal(photos.size(), 0);
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 0);
});

test('insert failure refunds quota', async () => {
  const photos = createMemoryPhotoStorage();
  const base = createMemoryScanRepository();
  const scans: ScanRepository = {
    findByIdempotencyKey: (u, k) => base.findByIdempotencyKey(u, k),
    deleteById: (id) => base.deleteById(id),
    listByUserId: (u) => base.listByUserId(u),
    deleteAllForUser: (u) => base.deleteAllForUser(u),
    async insert() {
      throw new Error('insert_failed');
    },
  };
  const { pipeline, quota, consents } = buildPipeline({ scans, photos });
  await grantFaceConsent(consents);
  await assert.rejects(
    () =>
      pipeline.createScan({
        userId: USER,
        idempotencyKey: 'idem-fail-ins',
        imageBase64: IMAGE_B64,
        contentType: 'image/jpeg',
      }),
    /insert_failed/,
  );
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 0);
  assert.equal(photos.size(), 0);
});

test('second free scan is blocked after quota used', async () => {
  const { pipeline, consents } = buildPipeline();
  await grantFaceConsent(consents);
  await pipeline.createScan({
    userId: USER,
    idempotencyKey: 'idem-first',
    imageBase64: IMAGE_B64,
    contentType: 'image/jpeg',
  });
  await assert.rejects(
    () =>
      pipeline.createScan({
        userId: USER,
        idempotencyKey: 'idem-second',
        imageBase64: IMAGE_B64,
        contentType: 'image/jpeg',
      }),
    (err: unknown) =>
      err instanceof Error && 'code' in err && (err as { code: string }).code === 'free_limit',
  );
});

test('scan refuses without face_analysis consent', async () => {
  const { pipeline } = buildPipeline();
  await assert.rejects(
    () =>
      pipeline.createScan({
        userId: USER,
        idempotencyKey: 'idem-no-consent',
        imageBase64: IMAGE_B64,
        contentType: 'image/jpeg',
      }),
    (err: unknown) => err instanceof HttpError && err.code === 'consent_required',
  );
});
