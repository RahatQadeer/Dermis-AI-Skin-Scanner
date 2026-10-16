import type { WebhookEventRepository } from './entitlementTypes';

export type SupabaseWebhookEventConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

/**
 * Inserts webhook event id. Unique PK → false when already processed.
 */
export function createSupabaseWebhookEventRepository(
  config: SupabaseWebhookEventConfig,
): WebhookEventRepository {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/billing_webhook_events`;

  return {
    async tryRecord(input) {
      const response = await fetchImpl(base, {
        method: 'POST',
        headers: {
          apikey: config.serviceRoleKey,
          authorization: `Bearer ${config.serviceRoleKey}`,
          'content-type': 'application/json',
          prefer: 'return=minimal',
        },
        body: JSON.stringify({
          event_id: input.eventId,
          provider: input.provider,
          event_type: input.eventType,
          app_user_id: input.appUserId,
          payload: input.payload,
        }),
      });

      if (response.ok) {
        return true;
      }
      if (response.status === 409) {
        return false;
      }
      const text = await response.text();
      if (/duplicate|unique/i.test(text)) {
        return false;
      }
      throw new Error('webhook_event_record_failed');
    },
  };
}
