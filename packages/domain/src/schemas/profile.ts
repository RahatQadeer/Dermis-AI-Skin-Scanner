import { z } from 'zod';

import { concernIdSchema } from './score';

export const skinTypeSchema = z.enum(['oily', 'combination', 'dry', 'normal']);

export const skinToneSchema = z.enum(['typeI_II', 'typeIII', 'typeIV', 'typeV_VI']);

export const sensitivitySchema = z.enum(['rarely', 'sometimes', 'easily']);

/** Privacy-friendly age bands (audience 18+). */
export const ageBandSchema = z.enum(['18_24', '25_34', '35_44', '45_plus']);

export const skinProfileSchema = z.object({
  skinType: skinTypeSchema,
  skinTone: skinToneSchema,
  /** Quiz step 3 — max 3 priority concerns. */
  priorityConcerns: z.array(concernIdSchema).max(3),
  sensitivity: sensitivitySchema,
  ageBand: ageBandSchema,
});

export type SkinProfile = z.infer<typeof skinProfileSchema>;
export type AgeBand = z.infer<typeof ageBandSchema>;
