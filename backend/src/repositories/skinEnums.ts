import { sensitivitySchema, skinToneSchema, skinTypeSchema } from '@dermis/domain';
import type { z } from 'zod';

export type SkinType = z.infer<typeof skinTypeSchema>;
export type SkinTone = z.infer<typeof skinToneSchema>;
export type Sensitivity = z.infer<typeof sensitivitySchema>;
