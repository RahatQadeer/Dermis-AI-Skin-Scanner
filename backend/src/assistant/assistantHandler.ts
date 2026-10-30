import { z } from 'zod';

import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import type { AssistantService } from './assistantService';

/** ~4 MB image as base64; photos are analysed in memory and never stored. */
const MAX_IMAGE_BASE64_CHARS = Math.ceil((4 * 1024 * 1024 * 4) / 3) + 4;

const turnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().trim().min(1).max(1000),
});

export const assistantRequestSchema = z.object({
  messages: z
    .array(turnSchema)
    .min(1)
    .max(12)
    .refine((turns) => turns[turns.length - 1]?.role === 'user', 'last_must_be_user'),
  image: z
    .object({
      base64: z.string().min(16).max(MAX_IMAGE_BASE64_CHARS),
      contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    })
    .optional(),
});

export async function handleAssistantMessage(
  service: AssistantService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const answer = await service.ask({ userId, ...parsed.data });
  return json(answer);
}
