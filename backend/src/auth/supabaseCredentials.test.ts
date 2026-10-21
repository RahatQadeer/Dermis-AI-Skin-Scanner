import assert from 'node:assert/strict';
import test from 'node:test';

import { createSupabaseCredentialsPort } from './supabaseCredentials';

test('signUp via admin create + password grant returns session', async () => {
  const calls: string[] = [];
  const port = createSupabaseCredentialsPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    serviceRoleKey: 'service',
    fetchImpl: async (input, init) => {
      const url = String(input);
      calls.push(url);
      if (url.includes('/admin/users')) {
        return new Response(JSON.stringify({ id: 'u1' }), { status: 200 });
      }
      if (url.includes('/token')) {
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
  assert.equal(calls.length, 2);
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
