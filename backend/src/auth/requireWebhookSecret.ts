import { timingSafeEqual } from 'node:crypto';

import { HttpError } from '../http/HttpError';
import { extractBearer } from './extractBearer';

/**
 * RevenueCat webhooks authenticate with Authorization: Bearer <shared secret>.
 * Constant-time compare to avoid leaking the secret via timing.
 */
export function requireWebhookSecret(request: Request, expectedSecret: string): void {
  if (!expectedSecret) {
    throw new HttpError(500, 'webhook_secret_missing');
  }

  const provided = extractBearer(request.headers.get('authorization'));
  if (!provided || !secretsEqual(provided, expectedSecret)) {
    throw new HttpError(401, 'invalid_webhook_signature');
  }
}

function secretsEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
