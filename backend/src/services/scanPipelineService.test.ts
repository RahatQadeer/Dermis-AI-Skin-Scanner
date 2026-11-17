import assert from 'node:assert/strict';
import test from 'node:test';

// Deterministic product free quota for these tests (ignore local .env unlock overrides).
process.env.DERMIS_BILLING_MODE = 'store';
process.env.DERMIS_FORCE_PRO = '0';
process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES = '0';
process.env.DERMIS_FREE_LIFETIME_SCANS = '1';

import { createFakeSkinAnalyzer } from '../adapters/fakeSkinAnalyzer';
import { createMemoryPhotoStorage } from '../adapters/memoryPhotoStorage';
import { FACE_ANALYSIS_CONSENT_VERSION } from '../constants/consent';
import { HttpError } from '../http/HttpError';
import { deterministicEmbedFromBytes } from '../lib/deterministicFaceEmbed';
import { createMemoryConsentRepository } from '../repositories/memoryConsentRepository';
import { createMemoryFaceReferenceRepository } from '../repositories/memoryFaceReferenceRepository';
import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createMemoryQuotaRepository } from '../repositories/memoryQuotaRepository';
import { createMemoryScanRepository } from '../repositories/memoryScanRepository';
import type { ScanRepository } from '../repositories/scanTypes';
import { createConsentService } from '../services/consentService';
import { createFaceReferenceService } from '../services/faceReferenceService';
import { createLivenessChallengeService } from '../services/livenessChallengeService';
import { createQuotaService } from '../services/quotaService';
import { createScanPipelineService } from '../services/scanPipelineService';

const USER = '55555555-5555-4555-8555-555555555555';
const MODEL = 'tfjs:test-mobilefacenet:v1';
const FACE_BOX = { xMin: 0.2, yMin: 0.2, width: 0.5, height: 0.5 };

/** Owner enrollment / matching selfie bytes. */
const OWNER_JPEG = Uint8Array.from([
  0xff,
  0xd8,
  0xff,
  0xd9,
  ...Array.from({ length: 64 }, (_, i) => (i * 3 + 11) & 0xff),
]);
/** Completely different person bytes. */
const OTHER_JPEG = Uint8Array.from([
  0xff,
  0xd8,
  0xff,
  0xd9,
  ...Array.from({ length: 64 }, (_, i) => (i * 7 + 199) & 0xff),
]);

const OWNER_B64 = Buffer.from(OWNER_JPEG).toString('base64');
const OTHER_B64 = Buffer.from(OTHER_JPEG).toString('base64');

function ownerEmbed(): number[] {
  return deterministicEmbedFromBytes(OWNER_JPEG, FACE_BOX);
}

function otherEmbed(): number[] {
  return deterministicEmbedFromBytes(OTHER_JPEG, FACE_BOX);
}

async function grantFaceConsent(consents: ReturnType<typeof createConsentService>): Promise<void> {
  await consents.applyGrant(USER, {
    type: 'face_analysis',
    version: FACE_ANALYSIS_CONSENT_VERSION,
    granted: true,
  });
}

async function enrollFace(faces: ReturnType<typeof createFaceReferenceService>): Promise<void> {
  const vector = ownerEmbed();
  await faces.register(USER, {
    embedding: vector,
    dim: vector.length,
    modelVersion: MODEL,
    referenceJpeg: OWNER_B64,
    faceBox: FACE_BOX,
  });
}

function completeLiveness(liveness: ReturnType<typeof createLivenessChallengeService>): string {
  const c = liveness.issue(USER, { preferPresent: true });
  const samples = [
    { t: 0, x: 0.5, y: 0.48 },
    { t: 120, x: 0.501, y: 0.481 },
    { t: 240, x: 0.499, y: 0.482 },
    { t: 400, x: 0.502, y: 0.48 },
  ];
  liveness.complete(USER, c.id, { samples });
  return c.id;
}

function buildPipeline(overrides?: {
  failAnalyzer?: boolean;
  faceUnclear?: boolean;
  scans?: ScanRepository;
  photos?: ReturnType<typeof createMemoryPhotoStorage>;
  analyzer?: ReturnType<typeof createFakeSkinAnalyzer> & {
    analyze: (...args: never[]) => Promise<unknown>;
  };
}) {
  const photos = overrides?.photos ?? createMemoryPhotoStorage();
  const quotaRepo = createMemoryQuotaRepository([{ userId: USER, plan: 'free' }]);
  const quota = createQuotaService(quotaRepo);
  const scans = overrides?.scans ?? createMemoryScanRepository();
  const profiles = createMemoryProfileRepository();
  const consentRepo = createMemoryConsentRepository();
  const consents = createConsentService(consentRepo);
  const faceReferences = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const liveness = createLivenessChallengeService();
  const analyzer =
    overrides?.analyzer ??
    createFakeSkinAnalyzer({
      fail: overrides?.failAnalyzer,
      faceUnclear: overrides?.faceUnclear,
    });

  const pipeline = createScanPipelineService({
    scans,
    profiles,
    quota,
    consent: consents,
    faceReferences,
    liveness,
    // Byte-bound — never a constant vector that would match both people.
    embedScanImage: async (bytes, box) => deterministicEmbedFromBytes(bytes, box),
    analyzer,
    photos,
  });

  return { pipeline, quota, photos, scans, consents, faceReferences, liveness, analyzer };
}

function scanInput(
  idempotencyKey: string,
  liveness: ReturnType<typeof createLivenessChallengeService>,
  opts?: { imageBase64?: string; embedding?: number[] },
) {
  const imageBase64 = opts?.imageBase64 ?? OWNER_B64;
  const embedding = opts?.embedding ?? ownerEmbed();
  return {
    userId: USER,
    idempotencyKey,
    imageBase64,
    contentType: 'image/jpeg' as const,
    faceIdentity: {
      embedding,
      modelVersion: MODEL,
      livenessPassed: true as const,
      livenessChallengeId: completeLiveness(liveness),
      faceBox: FACE_BOX,
    },
  };
}

test('scan pipeline creates scan, consumes free quota, deletes photo', async () => {
  const { pipeline, quota, photos, consents, faceReferences, liveness } = buildPipeline();
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  const result = await pipeline.createScan(scanInput('idem-key-0001', liveness));

  assert.equal(result.replayed, false);
  assert.equal(result.scan.indexScore >= 0, true);
  assert.equal(photos.size(), 0);
  const status = await quota.getStatus(USER);
  assert.equal(status.lifetimeScanCount, 1);
  assert.equal(status.remaining, 0);
});

test('scan pipeline rejects a mismatched face before analysis (Gemini never called)', async () => {
  let analyzeCalls = 0;
  const base = createFakeSkinAnalyzer();
  const analyzer = {
    ...base,
    async analyze(input: Parameters<typeof base.analyze>[0]) {
      analyzeCalls += 1;
      return base.analyze(input);
    },
  };
  const { pipeline, consents, faceReferences, photos, scans, quota, liveness } = buildPipeline({
    analyzer,
  });
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  await assert.rejects(
    () =>
      pipeline.createScan(
        scanInput('idem-mismatch', liveness, {
          imageBase64: OTHER_B64,
          embedding: otherEmbed(),
        }),
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_identity_mismatch',
  );
  assert.equal(analyzeCalls, 0, 'Gemini/analyzer must not run after identity failure');
  assert.equal((await scans.listByUserId(USER)).length, 0);
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 0);
  assert.equal(photos.size(), 0);
});

test('scan pipeline requires an enrolled face reference', async () => {
  const { pipeline, consents, liveness } = buildPipeline();
  await grantFaceConsent(consents);
  await assert.rejects(
    () => pipeline.createScan(scanInput('idem-no-face-ref', liveness)),
    (err: unknown) => err instanceof HttpError && err.code === 'face_reference_required',
  );
});

test('scan pipeline is idempotent for same key', async () => {
  const { pipeline, quota, consents, faceReferences, liveness } = buildPipeline();
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  const input = scanInput('idem-key-same', liveness);
  const first = await pipeline.createScan(input);
  const second = await pipeline.createScan(input);
  assert.equal(first.scan.id, second.scan.id);
  assert.equal(second.replayed, true);
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 1);
});

test('concurrent requests with the same key share one scan and one quota charge', async () => {
  const { pipeline, quota, consents, faceReferences, liveness } = buildPipeline();
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  const input = scanInput('idem-key-concurrent', liveness);
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
  const { pipeline, quota, consents, faceReferences, liveness } = buildPipeline({
    failAnalyzer: true,
    photos,
  });
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  await assert.rejects(
    () => pipeline.createScan(scanInput('idem-fail-an', liveness)),
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
  const { pipeline, quota, consents, faceReferences, liveness } = buildPipeline({ scans, photos });
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  await assert.rejects(
    () => pipeline.createScan(scanInput('idem-fail-ins', liveness)),
    /insert_failed/,
  );
  assert.equal((await quota.getStatus(USER)).lifetimeScanCount, 0);
  assert.equal(photos.size(), 0);
});

test('second free scan is blocked after quota used', async () => {
  const { pipeline, consents, faceReferences, liveness } = buildPipeline();
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  await pipeline.createScan(scanInput('idem-first', liveness));
  await assert.rejects(
    () => pipeline.createScan(scanInput('idem-second', liveness)),
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
  const faceReferences = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const liveness = createLivenessChallengeService();
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);

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
    faceReferences,
    liveness,
    embedScanImage: async (bytes, box) => deterministicEmbedFromBytes(bytes, box),
    analyzer,
    photos,
  });

  const result = await pipeline.createScan(scanInput('idem-stray-issue', liveness));
  assert.equal(result.replayed, false);
  assert.equal((await scans.listByUserId(USER)).length, 1);
});

test('unclear face is rejected and not saved', async () => {
  const { pipeline, quota, photos, scans, consents, faceReferences, liveness } = buildPipeline({
    faceUnclear: true,
  });
  await grantFaceConsent(consents);
  await enrollFace(faceReferences);
  await assert.rejects(
    () => pipeline.createScan(scanInput('idem-unclear', liveness)),
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
  const { pipeline, faceReferences, liveness } = buildPipeline();
  await enrollFace(faceReferences);
  await assert.rejects(
    () => pipeline.createScan(scanInput('idem-no-consent', liveness)),
    (err: unknown) => err instanceof HttpError && err.code === 'consent_required',
  );
});
