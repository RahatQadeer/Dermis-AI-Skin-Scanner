import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import type { ProfileService } from '../services/profileService';
import { profilePatchSchema, profileWriteSchema } from '../schemas/profileApi';
import type { ProfileRecord } from '../repositories/profileTypes';

export function toProfileDto(record: ProfileRecord) {
  return {
    id: record.id,
    skinType: record.skinType,
    skinTone: record.skinTone,
    sensitivity: record.sensitivity,
    priorityConcerns: record.priorityConcerns,
    notifyScanReminders: record.notifyScanReminders,
    notifyProductUpdates: record.notifyProductUpdates,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function handleGetProfile(service: ProfileService, userId: string): Promise<Response> {
  const profile = await service.get(userId);
  return json({ profile: toProfileDto(profile) });
}

export async function handleCreateProfile(
  service: ProfileService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = profileWriteSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const profile = await service.create(userId, parsed.data);
  return json({ profile: toProfileDto(profile) }, 201);
}

export async function handlePatchProfile(
  service: ProfileService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const profile = await service.update(userId, parsed.data);
  return json({ profile: toProfileDto(profile) });
}

export async function handleDeleteProfile(
  service: ProfileService,
  userId: string,
): Promise<Response> {
  const profile = await service.remove(userId);
  return json({ profile: toProfileDto(profile) });
}
