import { syncScanReminders } from '@/src/features/notifications/syncScanReminders';

import { fetchSettings, patchSettings } from '../api/settingsApi';

type LoadOpts = {
  setNotifications: (value: boolean) => void;
  setTips: (value: boolean) => void;
  showToast: (message: string) => void;
  loadError: string;
  isCancelled: () => boolean;
};

export async function loadProfileSettings(opts: LoadOpts): Promise<void> {
  try {
    const settings = await fetchSettings();
    if (opts.isCancelled()) {
      return;
    }
    opts.setTips(settings.notifyProductUpdates);
    await applyLoadedReminderPreference(settings.notifyScanReminders, opts);
  } catch {
    if (!opts.isCancelled()) {
      opts.showToast(opts.loadError);
    }
  }
}

async function applyLoadedReminderPreference(enabled: boolean, opts: LoadOpts): Promise<void> {
  if (!enabled) {
    opts.setNotifications(false);
    await syncScanReminders(false);
    return;
  }
  const sync = await syncScanReminders(true);
  if (opts.isCancelled()) {
    return;
  }
  opts.setNotifications(sync.ok && sync.enabled);
  if (!sync.ok) {
    await patchSettings({ notifyScanReminders: false }).catch(() => undefined);
  }
}
