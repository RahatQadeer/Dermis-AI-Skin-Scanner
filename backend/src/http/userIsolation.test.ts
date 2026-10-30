import assert from 'node:assert/strict';
import test from 'node:test';

// Deterministic product free quota (ignore local .env unlock overrides).
process.env.DERMIS_FORCE_PRO = '0';
process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES = '0';
process.env.DERMIS_FREE_LIFETIME_SCANS = '5';

import { FACE_ANALYSIS_CONSENT_VERSION } from '../constants/consent';
import { buildMemoryBackendDeps } from '../memoryBackend';
import { createApp } from './createApp';

const ALICE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const BOB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const IMAGE_B64 = Buffer.alloc(64, 7).toString('base64');

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

async function setUpUser(app: App, userId: string): Promise<void> {
  const consent = await call(app, userId, 'POST', '/v1/consents', {
    type: 'face_analysis',
    version: FACE_ANALYSIS_CONSENT_VERSION,
    granted: true,
  });
  assert.equal(consent.status, 201);
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

  const created = await call(app, ALICE, 'POST', '/v1/scans', {
    idempotencyKey: 'alice-scan-0001',
    imageBase64: IMAGE_B64,
  });
  assert.equal(created.status, 201);

  assert.equal((await listScanIds(app, ALICE)).length, 1);
  assert.deepEqual(await listScanIds(app, BOB), []);
});

test('reusing another user’s idempotency key never replays their scan', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  await setUpUser(app, BOB);

  const alice = await call(app, ALICE, 'POST', '/v1/scans', {
    idempotencyKey: 'shared-key-0001',
    imageBase64: IMAGE_B64,
  });
  const aliceScan = ((await alice.json()) as { scan: { id: string } }).scan;

  const bob = await call(app, BOB, 'POST', '/v1/scans', {
    idempotencyKey: 'shared-key-0001',
    imageBase64: IMAGE_B64,
  });
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
    idempotencyKey: 'spoof-key-0001',
    imageBase64: IMAGE_B64,
    userId: ALICE,
  });
  assert.equal(res.status, 201);
  assert.equal(((await res.json()) as { scan: { userId: string } }).scan.userId, BOB);
  assert.deepEqual(await listScanIds(app, ALICE), []);
});

test('deleting scan history only removes the caller’s scans', async () => {
  const app = buildApp();
  await setUpUser(app, ALICE);
  await setUpUser(app, BOB);
  for (const [userId, key] of [
    [ALICE, 'alice-del-0001'],
    [BOB, 'bob-del-00001'],
  ] as const) {
    const res = await call(app, userId, 'POST', '/v1/scans', {
      idempotencyKey: key,
      imageBase64: IMAGE_B64,
    });
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
    embedding: Array.from({ length: 128 }, (_, i) => Math.sin(i)),
    modelVersion: 'test-model',
  });
  assert.equal(enrolled.status, 201);

  // GET lazily creates the caller's own empty profile — never Alice's answers.
  const bobProfile = await call(app, BOB, 'GET', '/v1/profile');
  const bob = ((await bobProfile.json()) as { profile: { id: string; skinType: string | null } })
    .profile;
  assert.equal(bob.id, BOB);
  assert.equal(bob.skinType, null);

  // Positive control: Alice's enrollment really was stored.
  const aliceFace = await call(app, ALICE, 'GET', '/v1/face-reference');
  const aliceRef = ((await aliceFace.json()) as { reference: { enrolled: boolean } }).reference;
  assert.equal(aliceRef.enrolled, true);
  assert.ok('embedding' in aliceRef);

  const bobFace = await call(app, BOB, 'GET', '/v1/face-reference');
  const bobRef = ((await bobFace.json()) as { reference: { enrolled: boolean } }).reference;
  assert.equal(bobRef.enrolled, false);
  assert.ok(!('embedding' in bobRef), 'leaked another user’s face embedding');
});
