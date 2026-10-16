import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryQuotaRepository } from '../repositories/memoryQuotaRepository';
import { createQuotaService } from '../services/quotaService';

const FREE_USER = '33333333-3333-4333-8333-333333333333';
const PRO_USER = '44444444-4444-4444-8444-444444444444';

test('free tier allows exactly one consume under concurrency', async () => {
  const repo = createMemoryQuotaRepository([{ userId: FREE_USER, plan: 'free' }]);
  const quota = createQuotaService(repo);

  const results = await Promise.all(Array.from({ length: 20 }, () => quota.consume(FREE_USER)));

  const allowed = results.filter((r) => r.allowed);
  const blocked = results.filter((r) => !r.allowed);
  assert.equal(allowed.length, 1);
  assert.equal(blocked.length, 19);
  assert.ok(blocked.every((r) => !r.allowed && r.reason === 'free_limit'));

  const status = await quota.getStatus(FREE_USER);
  assert.equal(status.lifetimeScanCount, 1);
  assert.equal(status.remaining, 0);
});

test('pro tier allows exactly five consumes under concurrency', async () => {
  const repo = createMemoryQuotaRepository([{ userId: PRO_USER, plan: 'pro' }]);
  const quota = createQuotaService(repo);

  const results = await Promise.all(Array.from({ length: 30 }, () => quota.consume(PRO_USER)));

  const allowed = results.filter((r) => r.allowed);
  const blocked = results.filter((r) => !r.allowed);
  assert.equal(allowed.length, 5);
  assert.equal(blocked.length, 25);
  assert.ok(blocked.every((r) => !r.allowed && r.reason === 'daily_limit'));

  const status = await quota.getStatus(PRO_USER);
  assert.equal(status.dailyScanCount, 5);
  assert.equal(status.remaining, 0);
});

test('getStatus reflects remaining before consume', async () => {
  const repo = createMemoryQuotaRepository([{ userId: FREE_USER, plan: 'free' }]);
  const quota = createQuotaService(repo);
  const status = await quota.getStatus(FREE_USER);
  assert.equal(status.plan, 'free');
  assert.equal(status.remaining, 1);
});
