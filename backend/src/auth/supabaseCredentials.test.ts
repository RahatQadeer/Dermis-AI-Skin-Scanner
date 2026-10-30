import assert from 'node:assert/strict';
import test from 'node:test';

import { createSupabaseCredentialsPort } from './supabaseCredentials';

test('signUp uses the public endpoint and never auto-confirms via the admin API', async () => {
  const calls: string[] = [];
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (input, init) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith('/auth/v1/signup')) {
        assert.equal(init?.method, 'POST');
        return new Response(
          JSON.stringify({
            access_token: 'at',
            refresh_token: 'rt',
            user: { id: 'u1', email: 'a@b.c' },
          }),
          { status: 200 },
        );
      }
      return new Response('no', { status: 404 });
    },
  });

  const session = await port.signUp({
    email: 'A@B.C',
    password: 'Longenough1',
    firstName: 'Maya',
  });
  assert.deepEqual(session, {
    accessToken: 'at',
    refreshToken: 'rt',
    user: { id: 'u1', email: 'a@b.c', firstName: 'Maya' },
  });
  assert.deepEqual(calls, ['https://example.supabase.co/auth/v1/signup']);
});

test('signUp reports email_confirmation_required when the project requires confirmation', async () => {
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () =>
      new Response(JSON.stringify({ id: 'u1', email: 'a@b.c' }), { status: 200 }),
  });
  await assert.rejects(
    port.signUp({ email: 'a@b.c', password: 'Longenough1' }),
    (err: unknown) => (err as { code?: string }).code === 'email_confirmation_required',
  );
});

test('signIn maps invalid login to invalid_credentials', async () => {
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () =>
      new Response(JSON.stringify({ error_description: 'Invalid login credentials' }), {
        status: 400,
      }),
  });

  await assert.rejects(
    () => port.signIn({ email: 'a@b.c', password: 'wrong' }),
    (error) => {
      assert.equal((error as { code?: string }).code, 'invalid_credentials');
      return true;
    },
  );
});

test('signUp rejects weak password before calling Supabase', async () => {
  let called = false;
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () => {
      called = true;
      return new Response('{}', { status: 200 });
    },
  });

  await assert.rejects(
    () => port.signUp({ email: 'a@b.c', password: 'short' }),
    (error) => {
      assert.equal((error as { code?: string }).code, 'weak_password');
      return true;
    },
  );
  assert.equal(called, false);
});

test('signInWithGoogleIdToken exchanges id_token via GoTrue grant', async () => {
  let requestBody = '';
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (input, init) => {
      assert.equal(String(input), 'https://example.supabase.co/auth/v1/token?grant_type=id_token');
      assert.equal(init?.method, 'POST');
      requestBody = String(init?.body ?? '');
      return new Response(
        JSON.stringify({
          access_token: 'gat',
          refresh_token: 'grt',
          user: {
            id: 'gu1',
            email: 'g@example.com',
            user_metadata: { full_name: 'G User' },
          },
        }),
        { status: 200 },
      );
    },
  });

  const session = await port.signInWithGoogleIdToken('  google-jwt  ');
  assert.deepEqual(JSON.parse(requestBody), { provider: 'google', id_token: 'google-jwt' });
  assert.deepEqual(session, {
    accessToken: 'gat',
    refreshToken: 'grt',
    user: { id: 'gu1', email: 'g@example.com', firstName: 'G User' },
  });
});

test('signInWithGoogleIdToken rejects empty token before calling Supabase', async () => {
  let called = false;
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () => {
      called = true;
      return new Response('{}', { status: 200 });
    },
  });

  await assert.rejects(
    () => port.signInWithGoogleIdToken('   '),
    (error) => {
      assert.equal((error as { code?: string }).code, 'invalid_body');
      return true;
    },
  );
  assert.equal(called, false);
});

test('signInWithGoogleIdToken maps GoTrue failures', async () => {
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () =>
      new Response(JSON.stringify({ error_description: 'Invalid login credentials' }), {
        status: 400,
      }),
  });

  await assert.rejects(
    () => port.signInWithGoogleIdToken('bad'),
    (error) => {
      assert.equal((error as { code?: string }).code, 'invalid_credentials');
      return true;
    },
  );
});

test('signInWithAppleIdToken exchanges id_token with nonce via GoTrue grant', async () => {
  let requestBody = '';
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (input, init) => {
      assert.equal(String(input), 'https://example.supabase.co/auth/v1/token?grant_type=id_token');
      requestBody = String(init?.body ?? '');
      return new Response(
        JSON.stringify({
          access_token: 'aat',
          refresh_token: 'art',
          user: {
            id: 'au1',
            email: 'a@privaterelay.appleid.com',
          },
        }),
        { status: 200 },
      );
    },
  });

  const session = await port.signInWithAppleIdToken('  apple-jwt  ', { nonce: 'raw-nonce' });
  assert.deepEqual(JSON.parse(requestBody), {
    provider: 'apple',
    id_token: 'apple-jwt',
    nonce: 'raw-nonce',
  });
  assert.deepEqual(session, {
    accessToken: 'aat',
    refreshToken: 'art',
    user: { id: 'au1', email: 'a@privaterelay.appleid.com', firstName: null },
  });
});

test('signInWithAppleIdToken persists firstName after exchange when missing on user', async () => {
  const calls: { url: string; body: string }[] = [];
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (input, init) => {
      const url = String(input);
      calls.push({ url, body: String(init?.body ?? '') });
      if (url.includes('/auth/v1/token')) {
        return new Response(
          JSON.stringify({
            access_token: 'aat',
            refresh_token: 'art',
            user: { id: 'au1', email: 'a@privaterelay.appleid.com' },
          }),
          { status: 200 },
        );
      }
      assert.equal(url, 'https://example.supabase.co/auth/v1/user');
      assert.equal(init?.method, 'PUT');
      return new Response(JSON.stringify({ id: 'au1' }), { status: 200 });
    },
  });

  const session = await port.signInWithAppleIdToken('apple-jwt', {
    nonce: 'raw-nonce',
    firstName: 'Ada',
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[1]!.body), {
    data: { first_name: 'Ada', full_name: 'Ada' },
  });
  assert.equal(session.user.firstName, 'Ada');
});

test('signInWithAppleIdToken rejects empty token before calling Supabase', async () => {
  let called = false;
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () => {
      called = true;
      return new Response('{}', { status: 200 });
    },
  });

  await assert.rejects(
    () => port.signInWithAppleIdToken('   '),
    (error) => {
      assert.equal((error as { code?: string }).code, 'invalid_body');
      return true;
    },
  );
  assert.equal(called, false);
});

test('signInWithAppleIdToken maps GoTrue failures', async () => {
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () =>
      new Response(JSON.stringify({ error_description: 'Invalid login credentials' }), {
        status: 400,
      }),
  });

  await assert.rejects(
    () => port.signInWithAppleIdToken('bad', { nonce: 'n' }),
    (error) => {
      assert.equal((error as { code?: string }).code, 'invalid_credentials');
      return true;
    },
  );
});

test('recover sends the reset email with a redirect to the hosted page', async () => {
  const calls: { url: string; body: string }[] = [];
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (input, init) => {
      calls.push({ url: String(input), body: String(init?.body) });
      return new Response('{}', { status: 200 });
    },
  });
  await port.recover(' A@B.C ', 'https://api.example.com/reset-password');
  assert.equal(
    calls[0]!.url,
    'https://example.supabase.co/auth/v1/recover?redirect_to=https%3A%2F%2Fapi.example.com%2Freset-password',
  );
  assert.deepEqual(JSON.parse(calls[0]!.body), { email: 'a@b.c' });
});

test('recover hides upstream failures but surfaces throttling', async () => {
  const failing = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () => new Response('{}', { status: 500 }),
  });
  await failing.recover('a@b.c', 'https://x/reset-password');

  const throttled = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () => new Response('{}', { status: 429 }),
  });
  await assert.rejects(
    throttled.recover('a@b.c', 'https://x/reset-password'),
    (err: unknown) => (err as { code?: string }).code === 'rate_limited',
  );
});

test('updatePassword uses the recovery token and enforces the password rule', async () => {
  let auth = '';
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (_input, init) => {
      auth = new Headers(init?.headers).get('authorization') ?? '';
      return new Response('{}', { status: 200 });
    },
  });
  await assert.rejects(
    port.updatePassword('recovery-token', 'weak'),
    (err: unknown) => (err as { code?: string }).code === 'weak_password',
  );
  await port.updatePassword('recovery-token', 'Longenough1');
  assert.equal(auth, 'Bearer recovery-token');
});
