import { z } from 'zod';

import { MAX_EMBEDDING_DIM, MIN_EMBEDDING_DIM } from './faceReferenceApi';

export const MAX_SCAN_IMAGE_BYTES = 8 * 1024 * 1024;

/** Base64 expands ~4/3; allow small padding headroom before decode. */
export const MAX_SCAN_IMAGE_BASE64_CHARS = Math.ceil((MAX_SCAN_IMAGE_BYTES * 4) / 3) + 4;

const faceBoxSchema = z.object({
  xMin: z.number().finite(),
  yMin: z.number().finite(),
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
});

/** Live face proof required with every scan — server re-embeds the photo. */
export const scanFaceIdentitySchema = z.object({
  embedding: z.array(z.number().finite()).min(MIN_EMBEDDING_DIM).max(MAX_EMBEDDING_DIM),
  modelVersion: z.string().min(1).max(64),
  livenessPassed: z.literal(true),
  livenessChallengeId: z.string().uuid(),
  faceBox: faceBoxSchema,
});

export const createScanBodySchema = z.object({
  idempotencyKey: z.string().min(8).max(128),
  /** Raw image bytes as base64 (no data: URL prefix). */
  imageBase64: z.string().min(16).max(MAX_SCAN_IMAGE_BASE64_CHARS),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  faceIdentity: scanFaceIdentitySchema,
});

export type CreateScanBody = z.infer<typeof createScanBodySchema>;
