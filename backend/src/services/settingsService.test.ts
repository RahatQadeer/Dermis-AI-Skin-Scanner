import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryProfileRepository } from '../repositories/memoryProfileRepository';
import { createSettingsService } from '../services/settingsService';

const USER = '88888888-8888-4888-8888-888888888888';

test('settings get defaults and patch toggles', async () => {
  const service = createSettingsService(createMemoryProfileRepository());
  const initial = await service.get(USER);
  assert.equal(initial.notifyScanReminders, false);
  assert.equal(initial.notifyProductUpdates, false);

  const updated = await service.update(USER, { notifyScanReminders: true });
  assert.equal(updated.notifyScanReminders, true);
  assert.equal(updated.notifyProductUpdates, false);
});
