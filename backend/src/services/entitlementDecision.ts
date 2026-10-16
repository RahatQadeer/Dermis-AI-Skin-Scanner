import type { PlanTier } from '../repositories/entitlementTypes';
import type { RevenueCatWebhookPayload } from '../schemas/revenueCatWebhook';

/** Product entitlement identifier in RevenueCat dashboard. Override via env. */
export const DEFAULT_PRO_ENTITLEMENT_ID = 'pro';

const GRANT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'PRODUCT_CHANGE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

const REVOKE_TYPES = new Set(['EXPIRATION', 'REFUND']);

export type EntitlementDecision =
  | { action: 'grant_pro'; expiresAt: string | null }
  | { action: 'revoke_to_free' }
  | { action: 'ignore'; reason: string };

export function decideEntitlementFromEvent(
  event: RevenueCatWebhookPayload['event'],
  proEntitlementId: string = DEFAULT_PRO_ENTITLEMENT_ID,
): EntitlementDecision {
  const type = event.type.toUpperCase();

  if (type === 'TEST' || type === 'TRANSFER') {
    return { action: 'ignore', reason: type.toLowerCase() };
  }

  if (REVOKE_TYPES.has(type)) {
    return { action: 'revoke_to_free' };
  }

  if (GRANT_TYPES.has(type) || type === 'CANCELLATION') {
    if (!hasProEntitlement(event.entitlement_ids, proEntitlementId)) {
      return { action: 'ignore', reason: 'no_pro_entitlement' };
    }
    return {
      action: 'grant_pro',
      expiresAt: msToIso(event.expiration_at_ms),
    };
  }

  return { action: 'ignore', reason: 'unhandled_event_type' };
}

export function planFromDecision(decision: EntitlementDecision): PlanTier | null {
  if (decision.action === 'grant_pro') {
    return 'pro';
  }
  if (decision.action === 'revoke_to_free') {
    return 'free';
  }
  return null;
}

function hasProEntitlement(
  entitlementIds: string[] | null | undefined,
  proEntitlementId: string,
): boolean {
  if (!entitlementIds || entitlementIds.length === 0) {
    // Some events omit ids but still mean active sub — treat as pro when granting.
    return true;
  }
  return entitlementIds.includes(proEntitlementId);
}

function msToIso(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) {
    return null;
  }
  return new Date(ms).toISOString();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidUserId(value: string): boolean {
  return UUID_RE.test(value);
}
