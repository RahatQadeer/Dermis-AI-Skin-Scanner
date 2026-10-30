import type { AgeBand, ConcernId } from '@dermis/domain';
import type { Sensitivity, SkinTone, SkinType } from './skinEnums';

export type ProfileRecord = {
  id: string;
  skinType: SkinType | null;
  skinTone: SkinTone | null;
  sensitivity: Sensitivity | null;
  ageBand: AgeBand | null;
  priorityConcerns: ConcernId[];
  notifyScanReminders: boolean;
  notifyProductUpdates: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfileWriteInput = {
  skinType: SkinType;
  skinTone: SkinTone;
  sensitivity: Sensitivity;
  ageBand: AgeBand;
  priorityConcerns: ConcernId[];
  notifyScanReminders?: boolean;
  notifyProductUpdates?: boolean;
};

export type ProfilePatchInput = Partial<ProfileWriteInput>;

export type ProfileRepository = {
  findByUserId: (userId: string) => Promise<ProfileRecord | null>;
  insertEmpty: (userId: string) => Promise<ProfileRecord>;
  save: (userId: string, data: ProfileWriteInput) => Promise<ProfileRecord>;
  patch: (userId: string, data: ProfilePatchInput) => Promise<ProfileRecord | null>;
  clearSkinData: (userId: string) => Promise<ProfileRecord | null>;
  deleteByUserId: (userId: string) => Promise<boolean>;
};
