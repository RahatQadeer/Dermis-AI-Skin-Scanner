import { z } from 'zod';

export const MAX_SCAN_IMAGE_BYTES = 8 * 1024 * 1024;

/** Base64 expands ~4/3; allow small padding headroom before decode. */
export const MAX_SCAN_IMAGE_BASE64_CHARS = Math.ceil((MAX_SCAN_IMAGE_BYTES * 4) / 3) + 4;

export const createScanBodySchema = z.object({
  idempotencyKey: z.string().min(8).max(128),
  /** Raw image bytes as base64 (no data: URL prefix). */
  imageBase64: z.string().min(16).max(MAX_SCAN_IMAGE_BASE64_CHARS),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
});

export type CreateScanBody = z.infer<typeof createScanBodySchema>;
