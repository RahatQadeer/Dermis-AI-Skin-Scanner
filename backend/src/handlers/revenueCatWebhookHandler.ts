import { requireWebhookSecret } from '../auth/requireWebhookSecret';
import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import { revenueCatWebhookSchema } from '../schemas/revenueCatWebhook';
import type { EntitlementService } from '../services/entitlementService';

export type RevenueCatWebhookDeps = {
  webhookSecret: string;
  entitlements: EntitlementService;
};

export async function handleRevenueCatWebhook(
  request: Request,
  deps: RevenueCatWebhookDeps,
): Promise<Response> {
  requireWebhookSecret(request, deps.webhookSecret);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    throw new HttpError(400, 'invalid_json');
  }

  const parsed = revenueCatWebhookSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }

  const result = await deps.entitlements.applyRevenueCatEvent(parsed.data, rawBody);
  return json({ ok: true, ...result });
}
