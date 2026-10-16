import { getApiClient } from '@/src/lib/api/client';

export type SettingsDto = {
  notifyScanReminders: boolean;
  notifyProductUpdates: boolean;
};

export async function fetchSettings(): Promise<SettingsDto> {
  const res = await getApiClient().get<{ settings: SettingsDto }>('/v1/settings');
  return res.settings;
}

export async function patchSettings(patch: Partial<SettingsDto>): Promise<SettingsDto> {
  const res = await getApiClient().patch<{ settings: SettingsDto }>('/v1/settings', patch);
  return res.settings;
}
