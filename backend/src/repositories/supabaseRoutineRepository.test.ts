import assert from 'node:assert/strict';
import test from 'node:test';

import { createSupabaseRoutineRepository } from './supabaseRoutineRepository';

const USER = '77777777-7777-4777-8777-777777777777';

type Call = { method: string; url: string; auth: string; prefer: string | null; body: unknown };

function stepRow(id: string, sortOrder: number, label: string) {
  return {
    id,
    user_id: USER,
    period: 'am',
    sort_order: sortOrder,
    label,
    created_at: '2026-10-30T00:00:00Z',
    updated_at: '2026-10-30T00:00:00Z',
  };
}

function build(respond: (call: Call) => unknown) {
  const calls: Call[] = [];
  const repo = createSupabaseRoutineRepository({
    supabaseUrl: 'https://x.supabase.co',
    anonKey: 'anon',
    accessToken: 'user-jwt',
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers);
      const call: Call = {
        method: init?.method ?? 'GET',
        url: String(input),
        auth: headers.get('authorization') ?? '',
        prefer: headers.get('prefer'),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      };
      calls.push(call);
      return new Response(JSON.stringify(respond(call) ?? []), { status: 200 });
    },
  });
  return { repo, calls };
}

test('queries run under the user JWT and are scoped to the owner', async () => {
  const { repo, calls } = build(() => [stepRow('s1', 0, 'Cleanser')]);
  const steps = await repo.listSteps(USER);
  assert.equal(steps[0]!.label, 'Cleanser');
  assert.equal(calls[0]!.auth, 'Bearer user-jwt');
  assert.match(calls[0]!.url, new RegExp(`user_id=eq.${USER}`));
});

test('addStep appends after the current last step', async () => {
  const { repo, calls } = build((call) =>
    call.method === 'GET' ? [{ sort_order: 2 }] : [stepRow('s4', 3, 'SPF')],
  );
  const step = await repo.addStep({ userId: USER, period: 'am', label: '  SPF ' });
  assert.equal(step.sortOrder, 3);
  assert.deepEqual(calls[1]!.body, { user_id: USER, period: 'am', sort_order: 3, label: 'SPF' });
});

test('replacePeriod clears the period, then inserts in order', async () => {
  const { repo, calls } = build((call) =>
    call.method === 'POST' ? [stepRow('b', 1, 'Serum'), stepRow('a', 0, 'Cleanser')] : [],
  );
  const steps = await repo.replacePeriod(USER, 'am', ['Cleanser', 'Serum']);
  assert.equal(calls[0]!.method, 'DELETE');
  assert.match(calls[0]!.url, /period=eq\.am/);
  assert.deepEqual(
    steps.map((s) => s.label),
    ['Cleanser', 'Serum'],
  );
});

test('re-ticking a completed step is idempotent; unticking deletes', async () => {
  const { repo, calls } = build(() => []);
  await repo.setCompletion({ userId: USER, stepId: 's1', completedOn: '2026-10-30', done: true });
  assert.equal(calls[0]!.method, 'POST');
  assert.match(calls[0]!.prefer ?? '', /ignore-duplicates/);
  await repo.setCompletion({ userId: USER, stepId: 's1', completedOn: '2026-10-30', done: false });
  assert.equal(calls[1]!.method, 'DELETE');
});

test('invalid labels are rejected before any request', async () => {
  const { repo, calls } = build(() => []);
  await assert.rejects(repo.addStep({ userId: USER, period: 'pm', label: '   ' }), /invalid_label/);
  assert.equal(calls.length, 0);
});
