import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpError } from '../http/HttpError';
import { cosineSimilarity } from '../lib/faceMatch';
import { deterministicEmbedFromBytes } from '../lib/deterministicFaceEmbed';
import { createMemoryFaceReferenceRepository } from '../repositories/memoryFaceReferenceRepository';
import { assertScanFaceIdentity } from './faceIdentityGate';
import { createFaceReferenceService } from './faceReferenceService';
import { createLivenessChallengeService } from './livenessChallengeService';

const USER = '55555555-5555-4555-8555-555555555555';
const OTHER = '66666666-6666-4666-8666-666666666666';
const MODEL = 'tfjs:mobilefacenet.json:mfn-n128-align-v5';
const FACE_BOX = { xMin: 0.2, yMin: 0.2, width: 0.5, height: 0.5 };

/** Distinct synthetic JPEGs (byte content differs → embeddings differ). */
function jpegPerson(tag: number): Uint8Array {
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xd9,
    ...Array.from({ length: 80 }, (_, i) => (i * 17 + tag * 31) & 0xff),
  ]);
}

function b64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/** Production-like inject: embedding is a pure function of JPEG bytes + box. */
async function embedFromBytes(
  jpegBytes: Uint8Array,
  box: typeof FACE_BOX,
): Promise<number[]> {
  return deterministicEmbedFromBytes(jpegBytes, box);
}

async function enrolled(userId: string, enrollJpeg: Uint8Array) {
  const faces = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const vector = await embedFromBytes(enrollJpeg, FACE_BOX);
  await faces.register(userId, {
    embedding: vector,
    dim: vector.length,
    modelVersion: MODEL,
    referenceJpeg: b64(enrollJpeg),
    faceBox: FACE_BOX,
  });
  const liveness = createLivenessChallengeService();
  return { faces, liveness, vector, enrollJpeg };
}

async function completedChallenge(
  liveness: ReturnType<typeof createLivenessChallengeService>,
  userId: string,
) {
  const c = liveness.issue(userId, { preferPresent: true });
  const samples = [
    { t: 0, x: 0.5, y: 0.48 },
    { t: 120, x: 0.501, y: 0.481 },
    { t: 240, x: 0.499, y: 0.482 },
    { t: 400, x: 0.502, y: 0.48 },
  ];
  liveness.complete(userId, c.id, { samples });
  return c.id;
}

test('registered face is accepted (scan JPEG embeds match enrollment JPEG)', async () => {
  const enrollJpeg = jpegPerson(1);
  // Slightly different capture of same person (same tag → same deterministic identity).
  const scanJpeg = jpegPerson(1);
  const { faces, liveness } = await enrolled(USER, enrollJpeg);
  const challengeId = await completedChallenge(liveness, USER);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);

  await assertScanFaceIdentity(
    { faceReferences: faces, liveness, embedImage: embedFromBytes },
    USER,
    {
      embedding: scanEmbed,
      modelVersion: MODEL,
      livenessPassed: true,
      livenessChallengeId: challengeId,
      faceBox: FACE_BOX,
    },
    scanJpeg,
  );
});

test('completely different person face is rejected', async () => {
  const enrollJpeg = jpegPerson(1);
  const scanJpeg = jpegPerson(99);
  const { faces, liveness } = await enrolled(USER, enrollJpeg);
  const challengeId = await completedChallenge(liveness, USER);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);
  const enrollEmbed = await embedFromBytes(enrollJpeg, FACE_BOX);

  // Sanity: different people are below typical match threshold for this embedder.
  assert.ok(cosineSimilarity(scanEmbed, enrollEmbed) < 0.9);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: faces, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_identity_mismatch',
  );
});

test('similar-looking but different face (adjacent tag) is rejected at calibrated threshold', async () => {
  const enrollJpeg = jpegPerson(10);
  const nearJpeg = jpegPerson(11);
  const { faces, liveness } = await enrolled(USER, enrollJpeg);
  const challengeId = await completedChallenge(liveness, USER);
  const scanEmbed = await embedFromBytes(nearJpeg, FACE_BOX);
  const enrollEmbed = await embedFromBytes(enrollJpeg, FACE_BOX);
  assert.ok(
    cosineSimilarity(scanEmbed, enrollEmbed) < 0.94,
    'calibration sample must sit below production threshold',
  );

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: faces, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        nearJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_identity_mismatch',
  );
});

test('client cannot authorize by sending enrolled vector with someone else JPEG', async () => {
  const enrollJpeg = jpegPerson(1);
  const otherJpeg = jpegPerson(77);
  const { faces, liveness, vector: enrolledVector } = await enrolled(USER, enrollJpeg);
  const challengeId = await completedChallenge(liveness, USER);

  // Spoof: claim is the enrolled vector, but pixels are another person.
  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: faces, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: enrolledVector,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        otherJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_identity_mismatch',
  );
});

test('missing enrollment JPEG is rejected', async () => {
  const enrollJpeg = jpegPerson(1);
  const vector = await embedFromBytes(enrollJpeg, FACE_BOX);
  const bare = createFaceReferenceService({
    findByUserId: async () => ({
      userId: USER,
      enrollmentId: '11111111-1111-4111-8111-111111111101',
      embedding: vector,
      dim: vector.length,
      modelVersion: MODEL,
      referenceJpeg: null,
      faceBox: null,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    upsert: async () => {
      throw new Error('unused');
    },
    deleteByUserId: async () => false,
  });
  const liveness = createLivenessChallengeService();
  const challengeId = await completedChallenge(liveness, USER);
  const scanJpeg = jpegPerson(1);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: bare, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_model_mismatch',
  );
});

test('missing embedding / no enrollment record is rejected', async () => {
  const faces = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const liveness = createLivenessChallengeService();
  const challengeId = await completedChallenge(liveness, USER);
  const scanJpeg = jpegPerson(1);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: faces, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_reference_required',
  );
});

test('missing model / embedder failure is rejected (fail closed)', async () => {
  const enrollJpeg = jpegPerson(1);
  const { faces, liveness } = await enrolled(USER, enrollJpeg);
  const challengeId = await completedChallenge(liveness, USER);
  const scanJpeg = jpegPerson(1);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        {
          faceReferences: faces,
          liveness,
          embedImage: async () => null,
        },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) =>
      err instanceof HttpError && err.code === 'face_recognition_unavailable',
  );
});

test('face detection alone cannot authorize (identity mismatch still rejects)', async () => {
  // Detected face on scan, but wrong person vs enrollment.
  const enrollJpeg = jpegPerson(2);
  const scanJpeg = jpegPerson(50);
  const { faces, liveness } = await enrolled(USER, enrollJpeg);
  const challengeId = await completedChallenge(liveness, USER);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: faces, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_identity_mismatch',
  );
});

test('scan cannot become its own reference when enrollment JPEG is missing', async () => {
  const scanJpeg = jpegPerson(4);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);
  const bare = createFaceReferenceService({
    findByUserId: async () => ({
      userId: USER,
      enrollmentId: '11111111-1111-4111-8111-111111111102',
      embedding: scanEmbed,
      dim: scanEmbed.length,
      modelVersion: MODEL,
      referenceJpeg: null,
      faceBox: FACE_BOX,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    upsert: async () => {
      throw new Error('unused');
    },
    deleteByUserId: async () => false,
  });
  const liveness = createLivenessChallengeService();
  const challengeId = await completedChallenge(liveness, USER);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: bare, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_model_mismatch',
  );
});

test('another user enrollment cannot authorize this user scan', async () => {
  const aliceJpeg = jpegPerson(10);
  const bobJpeg = jpegPerson(20);
  const alice = await enrolled(USER, aliceJpeg);
  // Bob registers on a separate service instance with his own face.
  const bobFaces = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const bobVector = await embedFromBytes(bobJpeg, FACE_BOX);
  await bobFaces.register(OTHER, {
    embedding: bobVector,
    dim: bobVector.length,
    modelVersion: MODEL,
    referenceJpeg: b64(bobJpeg),
    faceBox: FACE_BOX,
  });

  // Alice's repo has no Bob data — Alice tries to scan with Bob's face.
  const challengeId = await completedChallenge(alice.liveness, USER);
  const bobScanEmbed = await embedFromBytes(bobJpeg, FACE_BOX);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        {
          faceReferences: alice.faces,
          liveness: alice.liveness,
          embedImage: embedFromBytes,
        },
        USER,
        {
          embedding: bobScanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: challengeId,
          faceBox: FACE_BOX,
        },
        bobJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_identity_mismatch',
  );
});

test('requires a completed liveness challenge', async () => {
  const enrollJpeg = jpegPerson(1);
  const { faces, liveness } = await enrolled(USER, enrollJpeg);
  const issued = liveness.issue(USER);
  const scanJpeg = jpegPerson(1);
  const scanEmbed = await embedFromBytes(scanJpeg, FACE_BOX);

  await assert.rejects(
    () =>
      assertScanFaceIdentity(
        { faceReferences: faces, liveness, embedImage: embedFromBytes },
        USER,
        {
          embedding: scanEmbed,
          modelVersion: MODEL,
          livenessPassed: true,
          livenessChallengeId: issued.id,
          faceBox: FACE_BOX,
        },
        scanJpeg,
      ),
    (err: unknown) => err instanceof HttpError && err.code === 'face_liveness_required',
  );
});
