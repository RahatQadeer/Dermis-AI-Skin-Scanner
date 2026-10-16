import { z } from 'zod';

import { concernScoresSchema, zoneScoresSchema } from './score';

export const geminiFaceIssueSchema = z.enum([
  'none',
  'no_face',
  'multiple_faces',
  'too_far',
  'too_close',
  'blurry',
  'poor_lighting',
  'obstructed',
  'not_front_facing',
]);

/** Strict JSON shape expected from the Gemini adapter (DERM-045). */
export const geminiScanAnalysisSchema = z.object({
  /** False when the photo is not a clear, single, front-facing face. */
  faceClear: z.boolean(),
  faceIssue: geminiFaceIssueSchema.optional().default('none'),
  concerns: concernScoresSchema,
  zones: zoneScoresSchema,
  /** Optional wellness notes per concern — not medical advice. */
  concernNotes: z.record(z.string(), z.string().max(500)).optional(),
});

export type GeminiScanAnalysis = z.infer<typeof geminiScanAnalysisSchema>;
export type GeminiFaceIssue = z.infer<typeof geminiFaceIssueSchema>;
