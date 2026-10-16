import { z } from 'zod';

import { FORMULA_VERSION } from '../constants';
import { concernScoresSchema, concernWeightsSchema, zoneScoresSchema } from './score';

export const scanRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  takenAt: z.string().datetime(),
  indexScore: z.number().int().min(0).max(100),
  concerns: concernScoresSchema,
  zones: zoneScoresSchema,
  formulaVersion: z.literal(FORMULA_VERSION),
  weights: concernWeightsSchema,
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  idempotencyKey: z.string().min(8).max(128),
});

export type ScanRecord = z.infer<typeof scanRecordSchema>;
