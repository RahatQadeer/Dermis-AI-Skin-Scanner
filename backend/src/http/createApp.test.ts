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

test('GET / and GET /health are public liveness routes', async () => {
  const app = buildApp();
  const root = await app(new Request('http://local/'));
  assert.equal(root.status, 200);
  assert.deepEqual(await root.json(), {
    ok: true,
    service: 'dermis-api',
    health: '/health',
  });
  const health = await app(new Request('http://local/health'));
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });
});

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

const unusedCredentials = {
  async signUp() {
    throw new Error('unused');
  },
  async signIn() {
    throw new Error('unused');
  },
  async signInWithGoogleIdToken(_idToken: string) {
    throw new Error('unused');
  },
  async signInWithAppleIdToken(_idToken: string) {
    throw new Error('unused');
  },
  async refresh() {
    throw new Error('unused');
  },
};

test('POST /v1/auth/sign-in returns session via credentials port', async () => {
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: {
      ...unusedCredentials,
      async signIn() {
        return {
          accessToken: 'at',
          refreshToken: 'rt',
          user: { id: USER_ID, email: 'a@b.c', firstName: null },
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
      user: { id: USER_ID, email: 'a@b.c', firstName: null },
    },
  });
});

test('POST /v1/auth/google returns 503 without credentials port', async () => {
  const app = buildApp();
  const res = await app(
    new Request('http://local/v1/auth/google', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'google-id-token' }),
    }),
  );
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: 'auth_credentials_not_configured' });
});

test('POST /v1/auth/google rejects missing idToken', async () => {
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: unusedCredentials,
  });
  const res = await app(
    new Request('http://local/v1/auth/google', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }),
  );
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'invalid_body' });
});

test('POST /v1/auth/google returns session from Google id token exchange', async () => {
  let receivedToken = '';
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: {
      ...unusedCredentials,
      async signInWithGoogleIdToken(idToken: string) {
        receivedToken = idToken;
        return {
          accessToken: 'google-at',
          refreshToken: 'google-rt',
          user: { id: USER_ID, email: 'g@example.com', firstName: 'G' },
        };
      },
    },
  });
  const res = await app(
    new Request('http://local/v1/auth/google', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: '  ya29.example  ' }),
    }),
  );
  assert.equal(res.status, 200);
  assert.equal(receivedToken, 'ya29.example');
  assert.deepEqual(await res.json(), {
    session: {
      accessToken: 'google-at',
      refreshToken: 'google-rt',
      user: { id: USER_ID, email: 'g@example.com', firstName: 'G' },
    },
  });
});

test('POST /v1/auth/google maps credential failures to auth error codes', async () => {
  const { HttpError } = await import('./HttpError');
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: {
      ...unusedCredentials,
      async signInWithGoogleIdToken() {
        throw new HttpError(401, 'invalid_credentials');
      },
    },
  });
  const res = await app(
    new Request('http://local/v1/auth/google', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'bad-token' }),
    }),
  );
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'invalid_credentials' });
});

test('POST /v1/auth/apple returns 503 without credentials port', async () => {
  const app = buildApp();
  const res = await app(
    new Request('http://local/v1/auth/apple', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'apple-id-token', nonce: 'raw-nonce' }),
    }),
  );
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: 'auth_credentials_not_configured' });
});

test('POST /v1/auth/apple rejects missing idToken', async () => {
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: unusedCredentials,
  });
  const res = await app(
    new Request('http://local/v1/auth/apple', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nonce: 'raw-nonce' }),
    }),
  );
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'invalid_body' });
});

test('POST /v1/auth/apple returns session from Apple id token exchange', async () => {
  let receivedToken = '';
  let receivedNonce = '';
  let receivedFirstName: string | undefined;
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: {
      ...unusedCredentials,
      async signInWithAppleIdToken(
        idToken: string,
        options?: { nonce?: string; firstName?: string },
      ) {
        receivedToken = idToken;
        receivedNonce = options?.nonce ?? '';
        receivedFirstName = options?.firstName;
        return {
          accessToken: 'apple-at',
          refreshToken: 'apple-rt',
          user: { id: USER_ID, email: 'a@privaterelay.appleid.com', firstName: 'Ada' },
        };
      },
    },
  });
  const res = await app(
    new Request('http://local/v1/auth/apple', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        idToken: '  apple.jwt  ',
        nonce: '  raw-nonce  ',
        firstName: ' Ada ',
      }),
    }),
  );
  assert.equal(res.status, 200);
  assert.equal(receivedToken, 'apple.jwt');
  assert.equal(receivedNonce, 'raw-nonce');
  assert.equal(receivedFirstName, 'Ada');
  assert.deepEqual(await res.json(), {
    session: {
      accessToken: 'apple-at',
      refreshToken: 'apple-rt',
      user: { id: USER_ID, email: 'a@privaterelay.appleid.com', firstName: 'Ada' },
    },
  });
});

test('POST /v1/auth/apple maps credential failures to auth error codes', async () => {
  const { HttpError } = await import('./HttpError');
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => createProfileService(createMemoryProfileRepository()),
    credentials: {
      ...unusedCredentials,
      async signInWithAppleIdToken() {
        throw new HttpError(401, 'invalid_credentials');
      },
    },
  });
  const res = await app(
    new Request('http://local/v1/auth/apple', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'bad-token', nonce: 'n' }),
    }),
  );
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'invalid_credentials' });
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

test('malformed JSON body is a 400, not a 500', async () => {
  const app = buildApp();
  const res = await app(
    new Request('http://local/v1/profile', {
      method: 'POST',
      headers: authHeaders(),
      body: '{"skinType":',
    }),
  );
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'invalid_json' });
});
