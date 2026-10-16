import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryAuthPort } from '../auth/memoryAuthPort';
import { FACE_ANALYSIS_CONSENT_VERSION } from '../constants/consent';
import { createApp } from '../http/createApp';
import { createMemoryConsentRepository } from '../repositories/memoryConsentRepository';
import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createConsentService } from '../services/consentService';
import { createProfileService } from '../services/profileService';

const USER_ID = '22222222-2222-4222-8222-222222222222';
const TOKEN = `user:${USER_ID}:consent@example.com`;

function buildApp() {
  const consents = createConsentService(createMemoryConsentRepository());
  return createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    consentsFor: () => consents,
  });
}

function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };
}

test('GET /v1/consents/status is false until face_analysis granted', async () => {
  const app = buildApp();
  const before = await app(
    new Request('http://local/v1/consents/status', { headers: authHeaders() }),
  );
  assert.equal(before.status, 200);
  const beforeJson = (await before.json()) as {
    status: { faceAnalysis: { granted: boolean; requiredVersion: string } };
  };
  assert.equal(beforeJson.status.faceAnalysis.granted, false);
  assert.equal(beforeJson.status.faceAnalysis.requiredVersion, FACE_ANALYSIS_CONSENT_VERSION);

  const granted = await app(
    new Request('http://local/v1/consents', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        type: 'face_analysis',
        version: FACE_ANALYSIS_CONSENT_VERSION,
        granted: true,
      }),
    }),
  );
  assert.equal(granted.status, 201);
  const grantJson = (await granted.json()) as { consent: { type: string; version: string } };
  assert.equal(grantJson.consent.type, 'face_analysis');
  assert.equal(grantJson.consent.version, FACE_ANALYSIS_CONSENT_VERSION);

  const after = await app(
    new Request('http://local/v1/consents/status', { headers: authHeaders() }),
  );
  const afterJson = (await after.json()) as {
    status: { faceAnalysis: { granted: boolean; activeVersion: string } };
  };
  assert.equal(afterJson.status.faceAnalysis.granted, true);
  assert.equal(afterJson.status.faceAnalysis.activeVersion, FACE_ANALYSIS_CONSENT_VERSION);
});

test('POST /v1/consents is idempotent for same type+version', async () => {
  const app = buildApp();
  const body = JSON.stringify({
    type: 'face_analysis',
    version: FACE_ANALYSIS_CONSENT_VERSION,
    granted: true,
  });
  const first = await app(
    new Request('http://local/v1/consents', {
      method: 'POST',
      headers: authHeaders(),
      body,
    }),
  );
  const firstJson = (await first.json()) as { consent: { id: string } };
  const second = await app(
    new Request('http://local/v1/consents', {
      method: 'POST',
      headers: authHeaders(),
      body,
    }),
  );
  const secondJson = (await second.json()) as { consent: { id: string } };
  assert.equal(secondJson.consent.id, firstJson.consent.id);

  const listed = await app(new Request('http://local/v1/consents', { headers: authHeaders() }));
  const listJson = (await listed.json()) as { consents: unknown[] };
  assert.equal(listJson.consents.length, 1);
});

test('revoke face_analysis clears status', async () => {
  const app = buildApp();
  await app(
    new Request('http://local/v1/consents', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        type: 'face_analysis',
        version: FACE_ANALYSIS_CONSENT_VERSION,
        granted: true,
      }),
    }),
  );
  const revoked = await app(
    new Request('http://local/v1/consents', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        type: 'face_analysis',
        version: FACE_ANALYSIS_CONSENT_VERSION,
        granted: false,
      }),
    }),
  );
  assert.equal(revoked.status, 200);
  const status = await app(
    new Request('http://local/v1/consents/status', { headers: authHeaders() }),
  );
  const statusJson = (await status.json()) as { status: { faceAnalysis: { granted: boolean } } };
  assert.equal(statusJson.status.faceAnalysis.granted, false);
});
