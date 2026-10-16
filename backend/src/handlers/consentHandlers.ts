import { json } from '../http/respond';
import type { ConsentService } from '../services/consentService';

export async function handleListConsents(
  service: ConsentService,
  userId: string,
): Promise<Response> {
  const consents = await service.list(userId);
  return json({ consents });
}

export async function handleConsentStatus(
  service: ConsentService,
  userId: string,
): Promise<Response> {
  return json({ status: await service.status(userId) });
}

export async function handleGrantConsent(
  service: ConsentService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const consent = await service.applyGrant(userId, body);
  const status = consent.revokedAt ? 200 : 201;
  return json({ consent }, status);
}
