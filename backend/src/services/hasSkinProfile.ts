import type { ProfileRecord } from '../repositories/profileTypes';

export function hasSkinProfile(record: ProfileRecord): boolean {
  return record.skinType !== null && record.skinTone !== null && record.sensitivity !== null;
}
