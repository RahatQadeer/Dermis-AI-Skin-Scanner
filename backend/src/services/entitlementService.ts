import type {
  EntitlementRecord,
  EntitlementRepository,
  EntitlementUpsert,
  WebhookEventRepository,
} from '../repositories/entitlementTypes';
import type { RevenueCatWebhookPayload } from '../schemas/revenueCatWebhook';
import { isProductionRuntime } from '@dermis/domain/server';

import { decideEntitlementFromEvent, isUuidUserId, planFromDecision } from './entitlementDecision';

export type EntitlementWebhookResult =
  | { status: 'applied'; entitlement: EntitlementRecord }
  | { status: 'duplicate' }
  | { status: 'ignored'; reason: string };

export type EntitlementService = {
  applyRevenueCatEvent: (
    payload: RevenueCatWebhookPayload,
    rawBody: unknown,
  ) => Promise<EntitlementWebhookResult>;
  /** Local/dev only — never expose without DERMIS_ALLOW_DEV_ENTITLEMENT / memory. */
  grantProForUser: (userId: string) => Promise<EntitlementRecord>;
};

export type EntitlementServiceOptions = {
  entitlements: EntitlementRepository;
  webhookEvents: WebhookEventRepository;
  proEntitlementId?: string;
};

export function createEntitlementService(options: EntitlementServiceOptions): EntitlementService {
  const proId = options.proEntitlementId ?? 'pro';

  return {
    async applyRevenueCatEvent(payload, rawBody) {
      const { event } = payload;
      const record = () =>
        options.webhookEvents.tryRecord({
          eventId: event.id,
          provider: 'revenuecat',
          eventType: event.type,
          appUserId: event.app_user_id,
          payload: rawBody,
        });

      const outcome = await decideOutcome(options, proId, event);
      if (outcome.status === 'ignored') {
        return (await record()) ? outcome : { status: 'duplicate' };
      }

      // Apply first, record second: if the write fails RevenueCat retries and the
      // retry is applied (the upsert is idempotent), instead of being dropped as
      // a duplicate of an event whose effect was lost.
      const entitlement = await options.entitlements.upsert(outcome.upsert);
      if (!(await record())) {
        return { status: 'duplicate' };
      }
      return { status: 'applied', entitlement };
    },

    async grantProForUser(userId) {
      if (!isUuidUserId(userId)) {
        throw new Error('invalid_user_id');
      }
      return options.entitlements.upsert({
        userId,
        plan: 'pro',
        proExpiresAt: null,
        revenueCatAppUserId: userId,
      });
    },
  };
}

type EventOutcome =
  { status: 'ignored'; reason: string } | { status: 'apply'; upsert: EntitlementUpsert };

async function decideOutcome(
  options: EntitlementServiceOptions,
  proId: string,
  event: RevenueCatWebhookPayload['event'],
): Promise<EventOutcome> {
  const rejected = precheckEvent(event);
  if (rejected) {
    return { status: 'ignored', reason: rejected };
  }

  const decision = decideEntitlementFromEvent(event, proId);
  const plan = planFromDecision(decision);
  if (!plan || decision.action === 'ignore') {
    return {
      status: 'ignored',
      reason: decision.action === 'ignore' ? decision.reason : 'no_plan_change',
    };
  }

  const eventAt = event.event_timestamp_ms ?? null;
  if (await isStaleEvent(options.entitlements, event.app_user_id, eventAt)) {
    return { status: 'ignored', reason: 'stale_event' };
  }

  return {
    status: 'apply',
    upsert: {
      userId: event.app_user_id,
      plan,
      proExpiresAt: decision.action === 'grant_pro' ? decision.expiresAt : null,
      revenueCatAppUserId: event.app_user_id,
      lastEventAtMs: eventAt,
    },
  };
}

function precheckEvent(event: RevenueCatWebhookPayload['event']): string | null {
  if (!isUuidUserId(event.app_user_id)) {
    return 'app_user_id_not_uuid';
  }
  // Sandbox (TestFlight / test store) purchases are free — never grant Pro from
  // them on a production backend unless explicitly allowed for review builds.
  if (event.environment === 'SANDBOX' && isProductionRuntime() && !acceptsSandboxPurchases()) {
    return 'sandbox_event';
  }
  return null;
}

/** An event older than the newest one already applied must not overwrite it. */
async function isStaleEvent(
  entitlements: EntitlementRepository,
  userId: string,
  eventAt: number | null,
): Promise<boolean> {
  if (eventAt === null) {
    return false;
  }
  const lastApplied = (await entitlements.findByUserId(userId))?.lastEventAtMs ?? null;
  return lastApplied !== null && eventAt < lastApplied;
}

function acceptsSandboxPurchases(): boolean {
  return process.env.DERMIS_ACCEPT_SANDBOX_PURCHASES === '1';
}
