import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createMemoryAuthPort } from '../auth/memoryAuthPort';
import {
  createMemoryEntitlementRepository,
  createMemoryWebhookEventRepository,
} from '../repositories/memoryEntitlementRepository';
import { createEntitlementService } from '../services/entitlementService';
import { createApp } from './createApp';

const USER_ID = '11111111-1111-4111-8111-111111111111';

test('POST /v1/dev/entitlements/pro grants pro when wired', async () => {
  const repo = createMemoryEntitlementRepository();
  const entitlements = createEntitlementService({
    entitlements: repo,
    webhookEvents: createMemoryWebhookEventRepository(),
  });
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => {
      throw new Error('unused');
    },
    devEntitlements: entitlements,
  });

  const res = await app(
    new Request('http://local/v1/dev/entitlements/pro', {
      method: 'POST',
      headers: {
        authorization: `Bearer user:${USER_ID}:dev@example.com`,
        'content-type': 'application/json',
      },
      body: '{}',
    }),
  );
  assert.equal(res.status, 200);
  const body = (await res.json()) as { plan: string };
  assert.equal(body.plan, 'pro');
  assert.equal((await repo.findByUserId(USER_ID))?.plan, 'pro');
});

test('POST /v1/dev/entitlements/pro is 403 when not wired', async () => {
  const app = createApp({
    auth: createMemoryAuthPort(),
    profilesFor: () => {
      throw new Error('unused');
    },
  });
  const res = await app(
    new Request('http://local/v1/dev/entitlements/pro', {
      method: 'POST',
      headers: {
        authorization: `Bearer user:${USER_ID}:dev@example.com`,
        'content-type': 'application/json',
      },
      body: '{}',
    }),
  );
  assert.equal(res.status, 403);
});
