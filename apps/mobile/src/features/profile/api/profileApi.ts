import type { ConcernId, SkinProfile } from '@dermis/domain';

import { getApiClient } from '@/src/lib/api/client';

export type SkinType = 'oily' | 'combination' | 'dry' | 'normal';
export type SkinTone = 'typeI_II' | 'typeIII' | 'typeIV' | 'typeV_VI';
export type Sensitivity = 'rarely' | 'sometimes' | 'easily';

export type ProfileDto = {
  id: string;
  skinType: SkinType | null;
  skinTone: SkinTone | null;
  sensitivity: Sensitivity | null;
  priorityConcerns: ConcernId[];
  notifyScanReminders: boolean;
  notifyProductUpdates: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Reads the signed-in user's profile (backend creates an empty row if none). */
export async function fetchProfile(): Promise<ProfileDto> {
  const res = await getApiClient().get<{ profile: ProfileDto }>('/v1/profile');
  return res.profile;
}

/** Persists the first-time skin assessment. 409 if a profile already exists. */
export async function createProfile(body: SkinProfile): Promise<ProfileDto> {
  const res = await getApiClient().post<{ profile: ProfileDto }>('/v1/profile', body);
  return res.profile;
}

/**
 * True once the three required skin-assessment fields are set. Mirrors the
 * backend `hasSkinProfile` gate so onboarding is treated as complete only when
 * the answers are actually persisted.
 */
export function profileHasSkinData(dto: ProfileDto): boolean {
  return dto.skinType !== null && dto.skinTone !== null && dto.sensitivity !== null;
}
