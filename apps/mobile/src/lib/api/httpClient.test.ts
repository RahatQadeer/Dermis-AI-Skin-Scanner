import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryAccessToken } from '../../features/session/createMemoryAccessToken';
import { ApiError } from './errors';
import { createApiClient } from './httpClient';

test('createMemoryAccessToken formats user bearer', () => {
  const token = createMemoryAccessToken('Alex@Example.com', '11111111-1111-4111-8111-111111111111');
  assert.equal(token, 'user:11111111-1111-4111-8111-111111111111:alex@example.com');
});

test('api client sends bearer and parses JSON', async () => {
  const prev = process.env.EXPO_PUBLIC_API_URL;
  process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
  const auths: string[] = [];
  const client = createApiClient({
    getAccessToken: () => 'user:abc:a@b.c',
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers);
      auths.push(headers.get('authorization') ?? '');
      assert.equal(String(input), 'http://api.test/v1/health');
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
  });
  try {
    const body = await client.get<{ ok: boolean }>('/v1/health');
    assert.equal(body.ok, true);
    assert.equal(auths[0], 'Bearer user:abc:a@b.c');
  } finally {
    process.env.EXPO_PUBLIC_API_URL = prev;
  }
});

test('api client maps error payloads', async () => {
  const prev = process.env.EXPO_PUBLIC_API_URL;
  process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
  const client = createApiClient({
    getAccessToken: () => 'tok',
    fetchImpl: async () =>
      new Response(JSON.stringify({ error: 'consent_required' }), { status: 403 }),
  });
  try {
    await assert.rejects(
      () => client.get('/v1/x'),
      (err: unknown) =>
        err instanceof ApiError && err.code === 'consent_required' && err.status === 403,
    );
  } finally {
    process.env.EXPO_PUBLIC_API_URL = prev;
  }
});

test('postPublic omits Authorization', async () => {
  const prev = process.env.EXPO_PUBLIC_API_URL;
  process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
  let authHeader: string | null = 'unset';
  const client = createApiClient({
    getAccessToken: () => null,
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers);
      authHeader = headers.get('authorization');
      assert.equal(String(input), 'http://api.test/v1/auth/sign-in');
      return new Response(
        JSON.stringify({
          session: {
            accessToken: 'at',
            refreshToken: null,
            user: { id: 'u1', email: 'a@b.c' },
          },
        }),
        { status: 200 },
      );
    },
  });
  try {
    const body = await client.postPublic<{ session: { accessToken: string } }>('/v1/auth/sign-in', {
      email: 'a@b.c',
      password: 'Longenough1',
    });
    assert.equal(body.session.accessToken, 'at');
    assert.equal(authHeader, null);
  } finally {
    process.env.EXPO_PUBLIC_API_URL = prev;
  }
});
