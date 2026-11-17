import assert from 'node:assert/strict';
import test from 'node:test';

// Deterministic product free quota (ignore local .env unlock overrides).
process.env.DERMIS_FORCE_PRO = '0';
process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES = '0';
process.env.DERMIS_FREE_LIFETIME_SCANS = '5';

import { FACE_ANALYSIS_CONSENT_VERSION } from '../constants/consent';
import { deterministicEmbedFromBytes } from '../lib/deterministicFaceEmbed';
import { buildMemoryBackendDeps } from '../memoryBackend';
import { createApp } from './createApp';

const ALICE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const BOB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const FACE_MODEL = 'tfjs:test-mobilefacenet:v1';
const FACE_BOX = { xMin: 0.2, yMin: 0.2, width: 0.5, height: 0.5 };

/** Per-user JPEG bytes — identity is bound to pixels, not a seed claim. */
function jpegFor(userId: string): Uint8Array {
  const tag = userId.charCodeAt(0);
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xd9,
    ...Array.from({ length: 64 }, (_, i) => (i * 13 + tag * 41) & 0xff),
  ]);
}

function b64For(userId: string): string {
  return Buffer.from(jpegFor(userId)).toString('base64');
}

function embedFor(userId: string): number[] {
  return deterministicEmbedFromBytes(jpegFor(userId), FACE_BOX);
}

const OTHER_JPEG = Uint8Array.from([
  0xff,
  0xd8,
  0xff,
  0xd9,
  ...Array.from({ length: 64 }, (_, i) => (i * 29 + 3) & 0xff),
]);
const OTHER_B64 = Buffer.from(OTHER_JPEG).toString('base64');
const OTHER_EMBED = deterministicEmbedFromBytes(OTHER_JPEG, FACE_BOX);

type App = ReturnType<typeof createApp>;

function call(app: App, userId: string, method: string, path: string, body?: unknown) {
  return app(
    new Request(`http://local${path}`, {
      method,
      headers: {
        authorization: `Bearer user:${userId}:${userId.slice(0, 4)}@example.com`,
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

async function completeLiveness(app: App, userId: string): Promise<string> {
  const issued = await call(app, userId, 'POST', '/v1/face-liveness/challenge', {
    preferPresent: true,
  });
  assert.equal(issued.status, 200);
  const challenge = ((await issued.json()) as { challenge: { id: string; type: string } })
    .challenge;
  const samples = [
    { t: 0, x: 0.5, y: 0.48 },
    { t: 120, x: 0.501, y: 0.481 },
    { t: 240, x: 0.499, y: 0.482 },
    { t: 400, x: 0.502, y: 0.48 },
  ];
  const done = await call(app, userId, 'POST', '/v1/face-liveness/complete', {
    challengeId: challenge.id,
    samples,
  });
  assert.equal(done.status, 200);
  return challenge.id;
}

async function scanBody(app: App, userId: string, idempotencyKey: string) {
  return {
    idempotencyKey,
    imageBase64: b64For(userId),
    faceIdentity: {
      embedding: embedFor(userId),
      modelVersion: FACE_MODEL,
      livenessPassed: true as const,
      livenessChallengeId: await completeLiveness(app, userId),
      faceBox: FACE_BOX,
    },
  };
}

async function setUpUser(app: App, userId: string): Promise<void> {
  const consent = await call(app, userId, 'POST', '/v1/consents', {
    type: 'face_analysis',
    version: FACE_ANALYSIS_CONSENT_VERSION,
    granted: true,
  });
  assert.equal(consent.status, 201);
  const enrolled = await call(app, userId, 'POST', '/v1/face-reference', {
    embedding: embedFor(userId),
    modelVersion: FACE_MODEL,
    imageBase64: b64For(userId),
    faceBox: FACE_BOX,
  });
  assert.equal(enrolled.status, 201);
}

async function listScanIds(app: App, userId: string): Promise<string[]> {
  const res = await call(app, userId, 'GET', '/v1/scans');
  assert.equal(res.status, 200);
  const body = (await res.json()) as { scans: { id: string; userId: string }[] };
  for (const scan of body.scans) {
    assert.equal(scan.userId, userId, 'listed a scan owned by another user');
  }
  return body.scans.map((s) => s.id);
}

function buildApp(): App {
  return createApp(buildMemoryBackendDeps({ preferFakeAnalyzer: true }));
}

test('scan history is isolated per authenticated user', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  await setUpUser(app, BOB);

  const created = await call(
    app,
    ALICE,
    'POST',
    '/v1/scans',
    await scanBody(app, ALICE, 'alice-scan-0001'),
  );
  assert.equal(created.status, 201);

  assert.equal((await listScanIds(app, ALICE)).length, 1);
  assert.deepEqual(await listScanIds(app, BOB), []);
});

test('reusing another user’s idempotency key never replays their scan', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  await setUpUser(app, BOB);

  const alice = await call(
    app,
    ALICE,
    'POST',
    '/v1/scans',
    await scanBody(app, ALICE, 'shared-key-0001'),
  );
  const aliceScan = ((await alice.json()) as { scan: { id: string } }).scan;

  const bob = await call(
    app,
    BOB,
    'POST',
    '/v1/scans',
    await scanBody(app, BOB, 'shared-key-0001'),
  );
  assert.equal(bob.status, 201);
  const bobBody = (await bob.json()) as { scan: { id: string; userId: string }; replayed: boolean };
  assert.equal(bobBody.replayed, false);
  assert.equal(bobBody.scan.userId, BOB);
  assert.notEqual(bobBody.scan.id, aliceScan.id);
});

test('a userId in the request body cannot redirect a scan to another account', async () => {
  const app = buildApp();
  await setUpUser(app, BOB);

  const res = await call(app, BOB, 'POST', '/v1/scans', {
    ...(await scanBody(app, BOB, 'spoof-key-0001')),
    userId: ALICE,
  });
  assert.equal(res.status, 201);
  assert.equal(((await res.json()) as { scan: { userId: string } }).scan.userId, BOB);
  assert.deepEqual(await listScanIds(app, ALICE), []);
});

test('scan without faceIdentity is rejected', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  const res = await call(app, ALICE, 'POST', '/v1/scans', {
    idempotencyKey: 'no-face-id-0001',
    imageBase64: b64For(ALICE),
  });
  assert.equal(res.status, 400);
});

test('scan with a different person face is rejected', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  const res = await call(app, ALICE, 'POST', '/v1/scans', {
    idempotencyKey: 'wrong-face-0001',
    imageBase64: OTHER_B64,
    faceIdentity: {
      embedding: OTHER_EMBED,
      modelVersion: FACE_MODEL,
      livenessPassed: true as const,
      livenessChallengeId: await completeLiveness(app, ALICE),
      faceBox: FACE_BOX,
    },
  });
  assert.equal(res.status, 403);
  assert.equal(((await res.json()) as { error: string }).error, 'face_identity_mismatch');
});

test('Bob face cannot authorize Alice scan', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  await setUpUser(app, BOB);
  const res = await call(app, ALICE, 'POST', '/v1/scans', {
    idempotencyKey: 'bob-face-on-alice',
    imageBase64: b64For(BOB),
    faceIdentity: {
      embedding: embedFor(BOB),
      modelVersion: FACE_MODEL,
      livenessPassed: true as const,
      livenessChallengeId: await completeLiveness(app, ALICE),
      faceBox: FACE_BOX,
    },
  });
  assert.equal(res.status, 403);
  assert.equal(((await res.json()) as { error: string }).error, 'face_identity_mismatch');
});

test('deleting scan history only removes the caller’s scans', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  await setUpUser(app, BOB);
  for (const [userId, key] of [
    [ALICE, 'alice-del-0001'],
    [BOB, 'bob-del-00001'],
  ] as const) {
    const res = await call(app, userId, 'POST', '/v1/scans', await scanBody(app, userId, key));
    assert.equal(res.status, 201);
  }

  const del = await call(app, BOB, 'DELETE', '/v1/scans');
  assert.deepEqual(await del.json(), { deleted: 1 });
  assert.deepEqual(await listScanIds(app, BOB), []);
  assert.equal((await listScanIds(app, ALICE)).length, 1);
});

test('skin profile and face reference are isolated per user', async () => {
  const app = buildApp();
  const profile = await call(app, ALICE, 'POST', '/v1/profile', {
    skinType: 'combination',
    skinTone: 'typeIII',
    sensitivity: 'sometimes',
    ageBand: '25_34',
    priorityConcerns: ['redness'],
    notifyScanReminders: false,
  });
  assert.equal(profile.status, 201);
  const enrolled = await call(app, ALICE, 'POST', '/v1/face-reference', {
    embedding: embedFor(ALICE),
    modelVersion: 'test-model',
    imageBase64: b64For(ALICE),
    faceBox: FACE_BOX,
  });
  assert.equal(enrolled.status, 201);

  const bobProfile = await call(app, BOB, 'GET', '/v1/profile');
  const bob = ((await bobProfile.json()) as { profile: { id: string; skinType: string | null } })
    .profile;
  assert.equal(bob.id, BOB);
  assert.equal(bob.skinType, null);

  const aliceFace = await call(app, ALICE, 'GET', '/v1/face-reference');
  const aliceRef = ((await aliceFace.json()) as { reference: { enrolled: boolean } }).reference;
  assert.equal(aliceRef.enrolled, true);
  assert.ok(!('embedding' in aliceRef), 'default GET must not leak embedding');

  const aliceFull = await call(app, ALICE, 'GET', '/v1/face-reference?includeEmbedding=1');
  const aliceFullRef = ((await aliceFull.json()) as { reference: { embedding?: number[] } })
    .reference;
  assert.ok(Array.isArray(aliceFullRef.embedding));

  const bobFace = await call(app, BOB, 'GET', '/v1/face-reference?includeEmbedding=1');
  const bobRef = ((await bobFace.json()) as { reference: { enrolled: boolean } }).reference;
  assert.equal(bobRef.enrolled, false);
  assert.ok(!('embedding' in bobRef), 'leaked another user’s face embedding');
});
