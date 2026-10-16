import { z } from 'zod';

export const consentTypeSchema = z.enum(['face_analysis', 'data_sharing', 'terms']);

export const consentRecordSchema = z.object({
  type: consentTypeSchema,
  version: z.string().min(1),
  grantedAt: z.string().datetime(),
  revokedAt: z.string().datetime().nullable().optional(),
});

export const consentGrantInputSchema = z.object({
  type: consentTypeSchema,
  version: z.string().min(1),
  granted: z.boolean(),
});

export type ConsentRecord = z.infer<typeof consentRecordSchema>;
