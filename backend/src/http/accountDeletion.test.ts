import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CONCERN_IDS,
  ZONE_IDS,
  type ConcernScores,
  type ConcernWeights,
  type ZoneScores,
} from '@dermis/domain/server';

import { createMemoryAuthPort } from '../auth/memoryAuthPort';
import { createApp } from '../http/createApp';
import {
  createMemoryAccountDataPort,
  createMemoryAuthAdmin,
  createMemoryDeletionRequestStore,
  registerMemoryEmail,
} from '../repositories/memoryAccountRepository';
import { createMemoryConsentRepository } from '../repositories/memoryConsentRepository';
import { createMemoryEntitlementRepository } from '../repositories/memoryEntitlementRepository';
import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createMemoryQuotaRepository } from '../repositories/memoryQuotaRepository';
import { createMemoryRoutineRepository } from '../repositories/memoryRoutineRepository';
import { createMemoryScanRepository } from '../repositories/memoryScanRepository';
import { createAccountService } from '../services/accountService';
import { createProfileService } from '../services/profileService';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const EMAIL = 'demo@example.com';
const TOKEN = `user:${USER_ID}:${EMAIL}`;

const skinBody = {
  skinType: 'combination' as const,
  skinTone: 'typeIII' as const,
  sensitivity: 'sometimes' as const,
  priorityConcerns: ['redness', 'hydration'] as const,
};

function buildAccountApp() {
  const profileRepo = createMemoryProfileRepository();
  const entitlementRepo = createMemoryEntitlementRepository();
  const quotaRepo = createMemoryQuotaRepository();
  const scanRepo = createMemoryScanRepository();
  const routineRepo = createMemoryRoutineRepository();
  const consentRepo = createMemoryConsentRepository();
  const emailIndex = new Map<string, string>();
  const deletedAuthUsers = new Set<string>();
  registerMemoryEmail(emailIndex, EMAIL, USER_ID);

  const account = createAccountService({
    data: createMemoryAccountDataPort({
      profiles: profileRepo,
      entitlements: entitlementRepo,
      quota: quotaRepo,
      scans: scanRepo,
      routine: routineRepo,
      consents: consentRepo,
      emailIndex,
    }),
    authAdmin: createMemoryAuthAdmin(deletedAuthUsers),
    deletionRequests: createMemoryDeletionRequestStore(),
  });

  const app = createApp({
    auth: createMemoryAuthPort({ deletedUserIds: deletedAuthUsers }),
    profilesFor: () => createProfileService(profileRepo),
    accountFor: () => account,
    publicAccount: account,
  });

  return { app, profileRepo, scanRepo, routineRepo, entitlementRepo, emailIndex };
}

function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };
}

test('GET /delete-account serves public HTML', async () => {
  const { app } = buildAccountApp();
  const res = await app(new Request('http://local/delete-account'));
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /text\/html/);
  const html = await res.text();
  assert.match(html, /Delete your Dermis account/);
  assert.match(html, /DELETE MY ACCOUNT/);
});

test('export then delete account removes data and invalidates auth', async () => {
  const { app, profileRepo, scanRepo, routineRepo } = buildAccountApp();

  await app(
    new Request('http://local/v1/profile', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(skinBody),
    }),
  );
  const concerns = Object.fromEntries(CONCERN_IDS.map((id) => [id, 70])) as ConcernScores;
  const zones = Object.fromEntries(ZONE_IDS.map((id) => [id, 70])) as ZoneScores;
  const weights = Object.fromEntries(CONCERN_IDS.map((id) => [id, 1])) as ConcernWeights;
  await scanRepo.insert({
    userId: USER_ID,
    takenAt: new Date().toISOString(),
    indexScore: 70,
    concerns,
    zones,
    weights,
    formulaVersion: 'v1',
    model: 'fake',
    promptVersion: 'p1',
    idempotencyKey: 'k1',
  });
  await routineRepo.addStep({ userId: USER_ID, period: 'am', label: 'Cleanser' });

  const exported = await app(
    new Request('http://local/v1/account/export', { headers: authHeaders() }),
  );
  assert.equal(exported.status, 200);
  const exportJson = (await exported.json()) as {
    export: { userId: string; scans: unknown[]; routineSteps: unknown[] };
  };
  assert.equal(exportJson.export.userId, USER_ID);
  assert.equal(exportJson.export.scans.length, 1);
  assert.equal(exportJson.export.routineSteps.length, 1);

  const deleted = await app(
    new Request('http://local/v1/account', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ confirmation: 'DELETE' }),
    }),
  );
  assert.equal(deleted.status, 200);

  assert.equal(await profileRepo.findByUserId(USER_ID), null);
  assert.equal((await scanRepo.listByUserId(USER_ID)).length, 0);
  assert.equal((await routineRepo.listSteps(USER_ID)).length, 0);

  const me = await app(new Request('http://local/v1/auth/me', { headers: authHeaders() }));
  assert.equal(me.status, 401);

  const exportAfter = await app(
    new Request('http://local/v1/account/export', { headers: authHeaders() }),
  );
  assert.equal(exportAfter.status, 401);
});

test('public deletion request purges by email without leaking existence', async () => {
  const { app, profileRepo } = buildAccountApp();
  await app(
    new Request('http://local/v1/profile', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(skinBody),
    }),
  );

  const missing = await app(
    new Request('http://local/v1/public/deletion-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@example.com',
        confirmation: 'DELETE MY ACCOUNT',
      }),
    }),
  );
  assert.equal(missing.status, 202);
  assert.deepEqual(await missing.json(), { accepted: true });

  const found = await app(
    new Request('http://local/v1/public/deletion-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: EMAIL,
        confirmation: 'DELETE MY ACCOUNT',
      }),
    }),
  );
  assert.equal(found.status, 202);
  assert.deepEqual(await found.json(), { accepted: true });
  assert.equal(await profileRepo.findByUserId(USER_ID), null);
});

test('DELETE /v1/account rejects wrong confirmation', async () => {
  const { app } = buildAccountApp();
  const res = await app(
    new Request('http://local/v1/account', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ confirmation: 'please' }),
    }),
  );
  assert.equal(res.status, 400);
});
