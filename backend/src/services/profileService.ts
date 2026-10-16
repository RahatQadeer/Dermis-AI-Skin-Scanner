import { HttpError } from '../http/HttpError';
import type {
  ProfilePatchInput,
  ProfileRecord,
  ProfileRepository,
  ProfileWriteInput,
} from '../repositories/profileTypes';
import { hasSkinProfile } from './hasSkinProfile';

export type ProfileService = {
  get: (userId: string) => Promise<ProfileRecord>;
  create: (userId: string, input: ProfileWriteInput) => Promise<ProfileRecord>;
  update: (userId: string, input: ProfilePatchInput) => Promise<ProfileRecord>;
  remove: (userId: string) => Promise<ProfileRecord>;
};

export function createProfileService(repo: ProfileRepository): ProfileService {
  return {
    async get(userId) {
      const row = await ensureRow(repo, userId);
      return row;
    },
    async create(userId, input) {
      const row = await ensureRow(repo, userId);
      if (hasSkinProfile(row)) {
        throw new HttpError(409, 'profile_exists');
      }
      return repo.save(userId, input);
    },
    async update(userId, input) {
      const row = await ensureRow(repo, userId);
      if (!hasSkinProfile(row) && !isCompleteWrite(input) && !isSettingsOnly(input)) {
        throw new HttpError(400, 'profile_incomplete');
      }
      const patched = await repo.patch(userId, input);
      if (!patched) {
        throw new HttpError(404, 'profile_not_found');
      }
      return patched;
    },
    async remove(userId) {
      const cleared = await repo.clearSkinData(userId);
      if (!cleared) {
        throw new HttpError(404, 'profile_not_found');
      }
      return cleared;
    },
  };
}

async function ensureRow(repo: ProfileRepository, userId: string): Promise<ProfileRecord> {
  const existing = await repo.findByUserId(userId);
  if (existing) {
    return existing;
  }
  return repo.insertEmpty(userId);
}

function isCompleteWrite(input: ProfilePatchInput): input is ProfileWriteInput {
  return (
    input.skinType !== undefined &&
    input.skinTone !== undefined &&
    input.sensitivity !== undefined &&
    input.priorityConcerns !== undefined
  );
}

function isSettingsOnly(input: ProfilePatchInput): boolean {
  const keys = Object.keys(input) as (keyof ProfilePatchInput)[];
  if (keys.length === 0) {
    return false;
  }
  return keys.every((key) => key === 'notifyScanReminders' || key === 'notifyProductUpdates');
}
