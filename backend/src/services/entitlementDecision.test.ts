import assert from 'node:assert/strict';
import test from 'node:test';

import { decideEntitlementFromEvent, isUuidUserId } from '../services/entitlementDecision';

test('decideEntitlementFromEvent grants on INITIAL_PURCHASE', () => {
  const decision = decideEntitlementFromEvent({
    id: '1',
    type: 'INITIAL_PURCHASE',
    app_user_id: 'u',
    entitlement_ids: ['pro'],
    expiration_at_ms: 1_700_000_000_000,
  });
  assert.equal(decision.action, 'grant_pro');
});

test('decideEntitlementFromEvent revokes on EXPIRATION', () => {
  const decision = decideEntitlementFromEvent({
    id: '2',
    type: 'EXPIRATION',
    app_user_id: 'u',
  });
  assert.equal(decision.action, 'revoke_to_free');
});

test('isUuidUserId validates uuid shape', () => {
  assert.equal(isUuidUserId('22222222-2222-4222-8222-222222222222'), true);
  assert.equal(isUuidUserId('$RCAnonymousID:abc'), false);
});
