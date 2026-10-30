import { z } from 'zod';

/** Embedding dimension bounds (MobileFaceNet = 128/192/512). */
export const MIN_EMBEDDING_DIM = 32;
export const MAX_EMBEDDING_DIM = 1024;

export const faceReferenceWriteSchema = z.object({
  embedding: z
    .array(z.number().finite())
    .min(MIN_EMBEDDING_DIM)
    .max(MAX_EMBEDDING_DIM),
  modelVersion: z.string().min(1).max(64),
  /** Explicit opt-in to overwrite an existing enrolled reference. */
  replace: z.boolean().optional(),
});

export type FaceReferenceWriteBody = z.infer<typeof faceReferenceWriteSchema>;
