import type { AgeBand, ConcernId } from '@dermis/domain';

import type { ProfilePatchInput, ProfileRecord, ProfileWriteInput } from './profileTypes';
import type { Sensitivity, SkinTone, SkinType } from './skinEnums';

export type DbProfileRow = {
  id: string;
  skin_type: SkinType | null;
  skin_tone: SkinTone | null;
  sensitivity: Sensitivity | null;
  age_band: AgeBand | null;
  priority_concerns: ConcernId[] | null;
  notify_scan_reminders: boolean;
  notify_product_updates: boolean;
  created_at: string;
  updated_at: string;
};

export function fromDbProfile(row: DbProfileRow): ProfileRecord {
  return {
    id: row.id,
    skinType: row.skin_type,
    skinTone: row.skin_tone,
    sensitivity: row.sensitivity,
    ageBand: row.age_band ?? null,
    priorityConcerns: row.priority_concerns ?? [],
    notifyScanReminders: row.notify_scan_reminders,
    notifyProductUpdates: row.notify_product_updates,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toDbWrite(data: ProfileWriteInput): Record<string, unknown> {
  return {
    skin_type: data.skinType,
    skin_tone: data.skinTone,
    sensitivity: data.sensitivity,
    age_band: data.ageBand,
    priority_concerns: data.priorityConcerns,
    ...(data.notifyScanReminders !== undefined
      ? { notify_scan_reminders: data.notifyScanReminders }
      : {}),
    ...(data.notifyProductUpdates !== undefined
      ? { notify_product_updates: data.notifyProductUpdates }
      : {}),
  };
}

export function toDbPatch(data: ProfilePatchInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (data.skinType !== undefined) body.skin_type = data.skinType;
  if (data.skinTone !== undefined) body.skin_tone = data.skinTone;
  if (data.sensitivity !== undefined) body.sensitivity = data.sensitivity;
  if (data.ageBand !== undefined) body.age_band = data.ageBand;
  if (data.priorityConcerns !== undefined) body.priority_concerns = data.priorityConcerns;
  if (data.notifyScanReminders !== undefined) {
    body.notify_scan_reminders = data.notifyScanReminders;
  }
  if (data.notifyProductUpdates !== undefined) {
    body.notify_product_updates = data.notifyProductUpdates;
  }
  return body;
}
