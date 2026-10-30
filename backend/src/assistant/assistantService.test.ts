import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DERMIS_BILLING_MODE = 'store';
process.env.DERMIS_FORCE_PRO = '0';
process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES = '0';

import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createMemoryQuotaRepository } from '../repositories/memoryQuotaRepository';
import { createMemoryScanRepository } from '../repositories/memoryScanRepository';
import { createQuotaService } from '../services/quotaService';
import { buildUserDataBlock } from './assistantPrompt';
import { assistantRequestSchema } from './assistantHandler';
import type { AssistantResponder } from './assistantResponder';
import { ASSISTANT_DAILY_LIMIT, createAssistantService } from './assistantService';
import { createMemoryAssistantUsageRepository } from './assistantUsage';

const PRO = '88888888-8888-4888-8888-888888888888';
const FREE = '99999999-9999-4999-8999-999999999999';
const OTHER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab';
const ask = [{ role: 'user' as const, text: 'How do I calm redness?' }];

const concerns = {
  redness: 41,
  fineLines: 70,
  hydration: 66,
  darkSpots: 72,
  texture: 68,
  pores: 59,
};

async function build() {
  const prompts: string[] = [];
  const responder: AssistantResponder = {
    async respond(input) {
      prompts.push(input.prompt);
      return { reply: 'ok', seeProfessional: false };
    },
  };
  const scans = createMemoryScanRepository();
  for (const [userId, score] of [
    [PRO, 64],
    [OTHER, 12],
  ] as const) {
    await scans.insert({
      userId,
      takenAt: '2026-10-29T08:00:00.000Z',
      indexScore: score,
      concerns,
      zones: { forehead: 70, tZone: 60, leftCheek: 65, rightCheek: 66, periorbital: 68, chin: 69 },
      weights: { redness: 1, fineLines: 1, hydration: 1, darkSpots: 1, texture: 1, pores: 1 },
      formulaVersion: 'index-v1',
      model: 'test',
      promptVersion: 'p',
      idempotencyKey: `k-${userId}`,
    });
  }
  const service = createAssistantService({
    responder,
    usage: createMemoryAssistantUsageRepository(),
    quota: createQuotaService(
      createMemoryQuotaRepository([
        { userId: PRO, plan: 'pro' },
        { userId: FREE, plan: 'free' },
      ]),
    ),
    profiles: createMemoryProfileRepository(),
    scans,
  });
  return { service, prompts };
}

test('free users are refused server-side (Pro feature)', async () => {
  const { service } = await build();
  await assert.rejects(
    service.ask({ userId: FREE, messages: ask }),
    (err: unknown) => (err as { code?: string }).code === 'pro_required',
  );
});

test('the prompt contains only the caller’s own scans', async () => {
  const { service, prompts } = await build();
  const answer = await service.ask({ userId: PRO, messages: ask });
  assert.equal(answer.reply, 'ok');
  assert.match(prompts[0]!, /index 64/);
  assert.doesNotMatch(prompts[0]!, /index 12/);
});

test('daily message cap is enforced', async () => {
  const { service } = await build();
  for (let i = 0; i < ASSISTANT_DAILY_LIMIT; i++) {
    await service.ask({ userId: PRO, messages: ask });
  }
  await assert.rejects(
    service.ask({ userId: PRO, messages: ask }),
    (err: unknown) => (err as { code?: string }).code === 'assistant_daily_limit',
  );
});

test('missing data is stated, never invented', () => {
  const block = buildUserDataBlock(null, []);
  assert.match(block, /not completed/);
  assert.match(block, /none yet/);
});

test('request schema: last turn must be the user, bounded size', () => {
  assert.equal(assistantRequestSchema.safeParse({ messages: ask }).success, true);
  assert.equal(
    assistantRequestSchema.safeParse({ messages: [{ role: 'assistant', text: 'hi' }] }).success,
    false,
  );
  assert.equal(
    assistantRequestSchema.safeParse({ messages: [{ role: 'user', text: 'x'.repeat(1001) }] })
      .success,
    false,
  );
});
