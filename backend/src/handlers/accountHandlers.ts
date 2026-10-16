import { z } from 'zod';

import { json } from '../http/respond';
import {
  ACCOUNT_DELETE_CONFIRMATION,
  PUBLIC_DELETE_CONFIRMATION,
  type AccountService,
} from '../services/accountService';

const deleteBodySchema = z.object({
  confirmation: z.literal(ACCOUNT_DELETE_CONFIRMATION),
});

const publicDeletionSchema = z.object({
  email: z.string().email().max(254),
  confirmation: z.literal(PUBLIC_DELETE_CONFIRMATION),
});

export async function handleExportAccount(
  service: AccountService,
  userId: string,
  email: string | null,
): Promise<Response> {
  const exportPayload = await service.exportData(userId, email);
  return json({ export: exportPayload });
}

export async function handleDeleteAccount(
  service: AccountService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = deleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'invalid_confirmation' }, 400);
  }
  await service.deleteAccount(userId, parsed.data.confirmation);
  return json({ deleted: true });
}

export async function handlePublicDeletionRequest(
  service: AccountService,
  body: unknown,
): Promise<Response> {
  const parsed = publicDeletionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'invalid_request' }, 400);
  }
  const result = await service.requestPublicDeletion(parsed.data.email, parsed.data.confirmation);
  return json(result, 202);
}
