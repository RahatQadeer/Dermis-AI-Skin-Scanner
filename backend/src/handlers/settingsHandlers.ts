import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import { settingsPatchSchema } from '../schemas/routineApi';
import type { SettingsService } from '../services/settingsService';

export async function handleGetSettings(
  service: SettingsService,
  userId: string,
): Promise<Response> {
  const settings = await service.get(userId);
  return json({ settings });
}

export async function handlePatchSettings(
  service: SettingsService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = settingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const settings = await service.update(userId, parsed.data);
  return json({ settings });
}
