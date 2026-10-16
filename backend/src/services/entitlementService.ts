import type {
  EntitlementRecord,
  EntitlementRepository,
  WebhookEventRepository,
} from '../repositories/entitlementTypes';
import type { RevenueCatWebhookPayload } from '../schemas/revenueCatWebhook';
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
      const recorded = await options.webhookEvents.tryRecord({
        eventId: event.id,
        provider: 'revenuecat',
        eventType: event.type,
        appUserId: event.app_user_id,
        payload: rawBody,
      });
      if (!recorded) {
        return { status: 'duplicate' };
      }

      if (!isUuidUserId(event.app_user_id)) {
        return { status: 'ignored', reason: 'app_user_id_not_uuid' };
      }

      const decision = decideEntitlementFromEvent(event, proId);
      const plan = planFromDecision(decision);
      if (!plan || decision.action === 'ignore') {
        return {
          status: 'ignored',
          reason: decision.action === 'ignore' ? decision.reason : 'no_plan_change',
        };
      }

      const entitlement = await options.entitlements.upsert({
        userId: event.app_user_id,
        plan,
        proExpiresAt: decision.action === 'grant_pro' ? decision.expiresAt : null,
        revenueCatAppUserId: event.app_user_id,
      });

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
