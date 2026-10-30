import assert from 'node:assert/strict';
import test from 'node:test';

// Deterministic product free quota for these tests (ignore local .env unlock overrides).
process.env.DERMIS_FORCE_PRO = '0';
process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES = '0';
process.env.DERMIS_FREE_LIFETIME_SCANS = '1';

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
  faceUnclear?: boolean;
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
  const analyzer = createFakeSkinAnalyzer({
    fail: overrides?.failAnalyzer,
    faceUnclear: overrides?.faceUnclear,
  });

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

test('concurrent requests with the same key share one scan and one quota charge', async () => {
  const { pipeline, quota, consents } = buildPipeline();
  await grantFaceConsent(consents);
  const input = {
    userId: USER,
    idempotencyKey: 'idem-key-concurrent',
    imageBase64: IMAGE_B64,
    contentType: 'image/jpeg' as const,
  };
  // e.g. the app retrying after a timeout while the first request still runs.
  const [first, second] = await Promise.all([
    pipeline.createScan(input),
    pipeline.createScan(input),
  ]);
  assert.equal(first.scan.id, second.scan.id);
  assert.equal(first.replayed, false);
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

test('faceClear=true is accepted even if model leaves a stray faceIssue', async () => {
  const photos = createMemoryPhotoStorage();
  const quotaRepo = createMemoryQuotaRepository([{ userId: USER, plan: 'free' }]);
  const quota = createQuotaService(quotaRepo);
  const scans = createMemoryScanRepository();
  const profiles = createMemoryProfileRepository();
  const consentRepo = createMemoryConsentRepository();
  const consents = createConsentService(consentRepo);
  await grantFaceConsent(consents);

  const base = createFakeSkinAnalyzer();
  const analyzer = {
    ...base,
    async analyze(input: Parameters<typeof base.analyze>[0]) {
      const result = await base.analyze(input);
      return { ...result, faceClear: true as const, faceIssue: 'blurry' as const };
    },
  };

  const pipeline = createScanPipelineService({
    scans,
    profiles,
    quota,
    consent: consents,
    analyzer,
    photos,
  });

  const result = await pipeline.createScan({
    userId: USER,
    idempotencyKey: 'idem-stray-issue',
    imageBase64: IMAGE_B64,
    contentType: 'image/jpeg',
  });
  assert.equal(result.replayed, false);
  assert.equal((await scans.listByUserId(USER)).length, 1);
});

test('unclear face is rejected and not saved', async () => {
  const { pipeline, quota, photos, scans, consents } = buildPipeline({ faceUnclear: true });
  await grantFaceConsent(consents);
  await assert.rejects(
    () =>
      pipeline.createScan({
        userId: USER,
        idempotencyKey: 'idem-unclear',
        imageBase64: IMAGE_B64,
        contentType: 'image/jpeg',
      }),
    (err: unknown) =>
      err instanceof HttpError &&
      err.code === 'face_obstructed' &&
      typeof err.detail === 'string' &&
      err.detail.includes('Forehead'),
  );
  assert.equal((await scans.listByUserId(USER)).length, 0);
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 0);
  assert.equal(photos.size(), 0);
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
