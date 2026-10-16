import { skinProfileSchema } from '@dermis/domain';
import { z } from 'zod';

export const profileWriteSchema = skinProfileSchema.extend({
  notifyScanReminders: z.boolean().optional(),
  notifyProductUpdates: z.boolean().optional(),
});

export const profilePatchSchema = profileWriteSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'empty_patch' });

export type ProfileWriteBody = z.infer<typeof profileWriteSchema>;
export type ProfilePatchBody = z.infer<typeof profilePatchSchema>;
