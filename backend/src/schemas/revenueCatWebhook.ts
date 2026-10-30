import { z } from 'zod';

/** RevenueCat webhook envelope (subset we need). */
export const revenueCatWebhookSchema = z.object({
  api_version: z.string().optional(),
  event: z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    app_user_id: z.string().min(1),
    original_app_user_id: z.string().optional(),
    entitlement_ids: z.array(z.string()).nullable().optional(),
    expiration_at_ms: z.number().nullable().optional(),
    purchased_at_ms: z.number().nullable().optional(),
    event_timestamp_ms: z.number().nullable().optional(),
    store: z.string().optional(),
    environment: z.enum(['SANDBOX', 'PRODUCTION']).optional(),
  }),
});

export type RevenueCatWebhookPayload = z.infer<typeof revenueCatWebhookSchema>;
