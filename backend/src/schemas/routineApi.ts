import { z } from 'zod';

export const routinePeriodSchema = z.enum(['am', 'pm']);

export const addRoutineStepSchema = z.object({
  period: routinePeriodSchema,
  label: z.string().min(1).max(80),
});

export const patchRoutineStepSchema = z.object({
  label: z.string().min(1).max(80),
});

export const completionSchema = z
  .object({
    done: z.boolean(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    /** Mobile historically sent completedOn; accept either. */
    completedOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .transform((value) => ({
    done: value.done,
    date: value.date ?? value.completedOn,
  }));

export const replaceRoutineSchema = z.object({
  am: z.array(z.string().min(1).max(80)).default([]),
  pm: z.array(z.string().min(1).max(80)).default([]),
});

export const settingsPatchSchema = z
  .object({
    notifyScanReminders: z.boolean().optional(),
    notifyProductUpdates: z.boolean().optional(),
  })
  .refine((v) => v.notifyScanReminders !== undefined || v.notifyProductUpdates !== undefined, {
    message: 'empty_settings',
  });
