import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../http/createApp';
import { createMemoryAuthPort } from '../auth/memoryAuthPort';
import {
  createMemoryEntitlementRepository,
  createMemoryWebhookEventRepository,
} from '../repositories/memoryEntitlementRepository';
import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createEntitlementService } from '../services/entitlementService';
import { createProfileService } from '../services/profileService';

const USER_ID = '22222222-2222-4222-8222-222222222222';
const SECRET = 'rc_webhook_test_secret';

function buildApp() {
  const entitlements = createMemoryEntitlementRepository();
  const webhookEvents = createMemoryWebhookEventRepository();
  const service = createEntitlementService({ entitlements, webhookEvents });
  const profiles = createProfileService(createMemoryProfileRepository());

  return {
    entitlements,
    app: createApp({
      auth: createMemoryAuthPort(),
      profilesFor: () => profiles,
      revenueCatWebhook: { webhookSecret: SECRET, entitlements: service },
    }),
  };
}

function purchaseBody(eventId: string) {
  return {
    api_version: '1.0',
    event: {
      id: eventId,
      type: 'INITIAL_PURCHASE',
      app_user_id: USER_ID,
      entitlement_ids: ['pro'],
      expiration_at_ms: Date.parse('2027-01-01T00:00:00.000Z'),
      environment: 'SANDBOX' as const,
    },
  };
}

test('RevenueCat webhook rejects bad signature', async () => {
  const { app } = buildApp();
  const res = await app(
    new Request('http://local/v1/webhooks/revenuecat', {
      method: 'POST',
      headers: {
        authorization: 'Bearer wrong',
        'content-type': 'application/json',
      },
      body: JSON.stringify(purchaseBody('evt_1')),
    }),
  );
  assert.equal(res.status, 401);
});

test('RevenueCat webhook grants pro and is idempotent', async () => {
  const { app, entitlements } = buildApp();
  const headers = {
    authorization: `Bearer ${SECRET}`,
    'content-type': 'application/json',
  };
  const body = JSON.stringify(purchaseBody('evt_grant_1'));

  const first = await app(
    new Request('http://local/v1/webhooks/revenuecat', {
      method: 'POST',
      headers,
      body,
    }),
  );
  assert.equal(first.status, 200);
  const firstJson = (await first.json()) as { status: string };
  assert.equal(firstJson.status, 'applied');

  const row = await entitlements.findByUserId(USER_ID);
  assert.equal(row?.plan, 'pro');
  assert.equal(row?.proExpiresAt, '2027-01-01T00:00:00.000Z');

  const second = await app(
    new Request('http://local/v1/webhooks/revenuecat', {
      method: 'POST',
      headers,
      body,
    }),
  );
  assert.equal(second.status, 200);
  const secondJson = (await second.json()) as { status: string };
  assert.equal(secondJson.status, 'duplicate');
});

test('EXPIRATION revokes to free', async () => {
  const { app, entitlements } = buildApp();
  const headers = {
    authorization: `Bearer ${SECRET}`,
    'content-type': 'application/json',
  };

  await app(
    new Request('http://local/v1/webhooks/revenuecat', {
      method: 'POST',
      headers,
      body: JSON.stringify(purchaseBody('evt_before_exp')),
    }),
  );

  const exp = await app(
    new Request('http://local/v1/webhooks/revenuecat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: {
          id: 'evt_exp',
          type: 'EXPIRATION',
          app_user_id: USER_ID,
          entitlement_ids: ['pro'],
        },
      }),
    }),
  );
  assert.equal(exp.status, 200);
  assert.equal((await entitlements.findByUserId(USER_ID))?.plan, 'free');
});
