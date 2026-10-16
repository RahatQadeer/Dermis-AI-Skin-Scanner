import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryAuthPort } from '../auth/memoryAuthPort';
import { createApp } from '../http/createApp';
import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createProfileService } from '../services/profileService';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const TOKEN = `user:${USER_ID}:demo@example.com`;

const skinBody = {
  skinType: 'combination' as const,
  skinTone: 'typeIII' as const,
  sensitivity: 'sometimes' as const,
  priorityConcerns: ['redness', 'hydration'] as const,
  notifyScanReminders: true,
};

function buildApp() {
  const profiles = createProfileService(createMemoryProfileRepository());
  return createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => profiles,
  });
}

function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };
}

test('POST /v1/auth/sign-up returns 503 without credentials port', async () => {
  const app = buildApp();
  const res = await app(
    new Request('http://local/v1/auth/sign-up', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.c', password: 'Longenough1' }),
    }),
  );
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: 'auth_credentials_not_configured' });
});

test('POST /v1/auth/sign-in returns session via credentials port', async () => {
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: {
      async signUp() {
        throw new Error('unused');
      },
      async signIn() {
        return {
          accessToken: 'at',
          refreshToken: 'rt',
          user: { id: USER_ID, email: 'a@b.c' },
        };
      },
    },
  });
  const res = await app(
    new Request('http://local/v1/auth/sign-in', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.c', password: 'secret' }),
    }),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    session: {
      accessToken: 'at',
      refreshToken: 'rt',
      user: { id: USER_ID, email: 'a@b.c' },
    },
  });
});

test('GET /v1/auth/me rejects missing token', async () => {
  const app = buildApp();
  const res = await app(new Request('http://local/v1/auth/me'));
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'missing_token' });
});

test('GET /v1/auth/me validates token and returns user', async () => {
  const app = buildApp();
  const res = await app(new Request('http://local/v1/auth/me', { headers: authHeaders() }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    user: { id: USER_ID, email: 'demo@example.com', firstName: null },
  });
});

test('profile CRUD: create, read, patch, delete skin data', async () => {
  const app = buildApp();

  const created = await app(
    new Request('http://local/v1/profile', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(skinBody),
    }),
  );
  assert.equal(created.status, 201);
  const createdJson = (await created.json()) as {
    profile: { skinType: string; notifyScanReminders: boolean };
  };
  assert.equal(createdJson.profile.skinType, 'combination');
  assert.equal(createdJson.profile.notifyScanReminders, true);

  const conflict = await app(
    new Request('http://local/v1/profile', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(skinBody),
    }),
  );
  assert.equal(conflict.status, 409);

  const got = await app(new Request('http://local/v1/profile', { headers: authHeaders() }));
  assert.equal(got.status, 200);

  const patched = await app(
    new Request('http://local/v1/profile', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ sensitivity: 'easily' }),
    }),
  );
  assert.equal(patched.status, 200);
  const patchedJson = (await patched.json()) as { profile: { sensitivity: string } };
  assert.equal(patchedJson.profile.sensitivity, 'easily');

  const deleted = await app(
    new Request('http://local/v1/profile', {
      method: 'DELETE',
      headers: authHeaders(),
    }),
  );
  assert.equal(deleted.status, 200);
  const deletedJson = (await deleted.json()) as { profile: { skinType: string | null } };
  assert.equal(deletedJson.profile.skinType, null);
});

test('GET /v1/profile requires auth', async () => {
  const app = buildApp();
  const res = await app(new Request('http://local/v1/profile'));
  assert.equal(res.status, 401);
});
