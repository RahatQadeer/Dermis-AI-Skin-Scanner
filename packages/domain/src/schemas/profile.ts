import { z } from 'zod';

import { concernIdSchema } from './score';

export const skinTypeSchema = z.enum(['oily', 'combination', 'dry', 'normal']);

export const skinToneSchema = z.enum(['typeI_II', 'typeIII', 'typeIV', 'typeV_VI']);

export const sensitivitySchema = z.enum(['rarely', 'sometimes', 'easily']);

export const skinProfileSchema = z.object({
  skinType: skinTypeSchema,
  skinTone: skinToneSchema,
  /** Quiz step 3 — max 3 priority concerns. */
  priorityConcerns: z.array(concernIdSchema).max(3),
  sensitivity: sensitivitySchema,
});

export type SkinProfile = z.infer<typeof skinProfileSchema>;
