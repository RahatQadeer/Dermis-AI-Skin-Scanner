import { z } from 'zod';

import { CONCERN_IDS } from '../concerns';
import { SCORE_MAX, SCORE_MIN } from '../constants';
import { ZONE_IDS } from '../zones';

const scoreField = z.number().int().min(SCORE_MIN).max(SCORE_MAX);

const concernShape = Object.fromEntries(CONCERN_IDS.map((id) => [id, scoreField])) as Record<
  (typeof CONCERN_IDS)[number],
  typeof scoreField
>;

const zoneShape = Object.fromEntries(ZONE_IDS.map((id) => [id, scoreField])) as Record<
  (typeof ZONE_IDS)[number],
  typeof scoreField
>;

export const concernIdSchema = z.enum(CONCERN_IDS);

export const concernScoresSchema = z.object(concernShape);

export const zoneIdSchema = z.enum(ZONE_IDS);

export const zoneScoresSchema = z.object(zoneShape);

export const concernWeightsSchema = z.object(
  Object.fromEntries(CONCERN_IDS.map((id) => [id, z.number().positive()])) as Record<
    (typeof CONCERN_IDS)[number],
    z.ZodNumber
  >,
);

export type ConcernScores = z.infer<typeof concernScoresSchema>;
export type ZoneScores = z.infer<typeof zoneScoresSchema>;
export type ConcernWeights = z.infer<typeof concernWeightsSchema>;
