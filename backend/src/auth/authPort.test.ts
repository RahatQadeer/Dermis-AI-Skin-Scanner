import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryAuthPort } from '../auth/memoryAuthPort';
import { createSupabaseAuthPort } from '../auth/supabaseAuthPort';

test('memory auth accepts user: tokens and rejects others', async () => {
  const auth = createMemoryAuthPort();
  const ok = await auth.verifyAccessToken('user:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  assert.equal(ok?.id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  assert.equal(await auth.verifyAccessToken('nope'), null);
});

test('supabase auth port maps /user response and treats non-OK as invalid', async () => {
  const calls: string[] = [];
  const auth = createSupabaseAuthPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async (input) => {
      calls.push(String(input));
      return new Response(JSON.stringify({ id: 'u1', email: 'a@b.c' }), {
        status: 200,
      });
    },
  });

  const user = await auth.verifyAccessToken('tok');
  assert.deepEqual(user, { id: 'u1', email: 'a@b.c', firstName: null });
  assert.match(calls[0]!, /\/auth\/v1\/user$/);

  const bad = createSupabaseAuthPort({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon',
    fetchImpl: async () => new Response('no', { status: 401 }),
  });
  assert.equal(await bad.verifyAccessToken('tok'), null);
});
