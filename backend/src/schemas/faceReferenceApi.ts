import { z } from 'zod';

/** Embedding dimension bounds (MobileFaceNet = 128/192/512). */
export const MIN_EMBEDDING_DIM = 32;
export const MAX_EMBEDDING_DIM = 1024;

/** Max enrolled selfie ~1.5MB base64 (~1MB JPEG). */
export const MAX_FACE_REF_IMAGE_BASE64_CHARS = 2_000_000;

const faceBoxSchema = z.object({
  xMin: z.number().finite(),
  yMin: z.number().finite(),
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
});

export const faceReferenceWriteSchema = z.object({
  embedding: z.array(z.number().finite()).min(MIN_EMBEDDING_DIM).max(MAX_EMBEDDING_DIM),
  modelVersion: z.string().min(1).max(64),
  /** Enrolled selfie — required so scans can compare photo-to-photo. */
  imageBase64: z.string().min(32).max(MAX_FACE_REF_IMAGE_BASE64_CHARS),
  faceBox: faceBoxSchema,
  replace: z.boolean().optional(),
  /** Add a different face; keeps prior scan history under the old enrollment. */
  addFace: z.boolean().optional(),
  currentFaceEmbedding: z
    .array(z.number().finite())
    .min(MIN_EMBEDDING_DIM)
    .max(MAX_EMBEDDING_DIM)
    .optional(),
});

export type FaceReferenceWriteBody = z.infer<typeof faceReferenceWriteSchema>;

export const livenessIssueSchema = z.object({
  preferPresent: z.boolean().optional(),
});

export const livenessCompleteSchema = z.object({
  challengeId: z.string().uuid(),
  samples: z
    .array(
      z.object({
        t: z.number().finite(),
        x: z.number().finite(),
        y: z.number().finite(),
      }),
    )
    .min(4)
    .max(120),
});
