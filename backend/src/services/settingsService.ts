import { HttpError } from '../http/HttpError';
import type { ProfileRepository } from '../repositories/profileTypes';

export type SettingsRecord = {
  notifyScanReminders: boolean;
  notifyProductUpdates: boolean;
};

export type SettingsService = {
  get: (userId: string) => Promise<SettingsRecord>;
  update: (userId: string, patch: Partial<SettingsRecord>) => Promise<SettingsRecord>;
};

export function createSettingsService(profiles: ProfileRepository): SettingsService {
  return {
    async get(userId) {
      const row = await profiles.findByUserId(userId);
      if (!row) {
        const created = await profiles.insertEmpty(userId);
        return toSettings(created);
      }
      return toSettings(row);
    },
    async update(userId, patch) {
      let row = await profiles.findByUserId(userId);
      if (!row) {
        row = await profiles.insertEmpty(userId);
      }
      const updated = await profiles.patch(userId, patch);
      if (!updated) {
        throw new HttpError(404, 'settings_not_found');
      }
      return toSettings(updated);
    },
  };
}

function toSettings(row: {
  notifyScanReminders: boolean;
  notifyProductUpdates: boolean;
}): SettingsRecord {
  return {
    notifyScanReminders: row.notifyScanReminders,
    notifyProductUpdates: row.notifyProductUpdates,
  };
}
