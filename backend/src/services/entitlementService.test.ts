import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createMemoryEntitlementRepository,
  createMemoryWebhookEventRepository,
} from '../repositories/memoryEntitlementRepository';
import type { EntitlementRepository } from '../repositories/entitlementTypes';
import { planAfterExpiry } from '../repositories/supabaseQuotaRepository';
import type { RevenueCatWebhookPayload } from '../schemas/revenueCatWebhook';
import { createEntitlementService } from './entitlementService';

const USER = '66666666-6666-4666-8666-666666666666';

function event(
  id: string,
  type: string,
  eventAt: number,
  extra: Partial<RevenueCatWebhookPayload['event']> = {},
): RevenueCatWebhookPayload {
  return {
    event: {
      id,
      type,
      app_user_id: USER,
      entitlement_ids: ['pro'],
      event_timestamp_ms: eventAt,
      expiration_at_ms: eventAt + 30 * 86_400_000,
      ...extra,
    },
  };
}

function build(entitlements: EntitlementRepository = createMemoryEntitlementRepository()) {
  const service = createEntitlementService({
    entitlements,
    webhookEvents: createMemoryWebhookEventRepository(),
  });
  return { service, entitlements };
}

test('an older EXPIRATION arriving after a newer RENEWAL does not downgrade', async () => {
  const { service, entitlements } = build();
  await service.applyRevenueCatEvent(event('renew', 'RENEWAL', 2_000), {});
  const late = await service.applyRevenueCatEvent(event('exp', 'EXPIRATION', 1_000), {});
  assert.deepEqual(late, { status: 'ignored', reason: 'stale_event' });
  assert.equal((await entitlements.findByUserId(USER))?.plan, 'pro');
});

test('a newer EXPIRATION downgrades', async () => {
  const { service, entitlements } = build();
  await service.applyRevenueCatEvent(event('buy', 'INITIAL_PURCHASE', 1_000), {});
  await service.applyRevenueCatEvent(event('exp', 'EXPIRATION', 2_000), {});
  assert.equal((await entitlements.findByUserId(USER))?.plan, 'free');
});

test('a failed write is retried on redelivery instead of being dropped as duplicate', async () => {
  const inner = createMemoryEntitlementRepository();
  let failNext = true;
  const flaky: EntitlementRepository = {
    ...inner,
    async upsert(input) {
      if (failNext) {
        failNext = false;
        throw new Error('entitlement_upsert_failed');
      }
      return inner.upsert(input);
    },
  };
  const { service } = build(flaky);
  const buy = event('buy', 'INITIAL_PURCHASE', 1_000);
  await assert.rejects(service.applyRevenueCatEvent(buy, {}));
  const retry = await service.applyRevenueCatEvent(buy, {});
  assert.equal(retry.status, 'applied');
  assert.equal((await inner.findByUserId(USER))?.plan, 'pro');

  const again = await service.applyRevenueCatEvent(buy, {});
  assert.equal(again.status, 'duplicate');
});

test('sandbox purchases do not grant Pro on a production backend', async () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const { service, entitlements } = build();
    const res = await service.applyRevenueCatEvent(
      event('sbx', 'INITIAL_PURCHASE', 1_000, { environment: 'SANDBOX' }),
      {},
    );
    assert.deepEqual(res, { status: 'ignored', reason: 'sandbox_event' });
    assert.equal(await entitlements.findByUserId(USER), null);
  } finally {
    process.env.NODE_ENV = prev;
  }
});

test('Pro lapses to free after pro_expires_at', () => {
  const now = new Date('2026-11-01T00:00:00.000Z');
  assert.equal(planAfterExpiry('pro', '2026-10-31T23:59:59.000Z', now), 'free');
  assert.equal(planAfterExpiry('pro', '2026-11-30T00:00:00.000Z', now), 'pro');
  assert.equal(planAfterExpiry('pro', null, now), 'pro');
  assert.equal(planAfterExpiry('free', null, now), 'free');
});
