import { syncScanReminders } from '@/src/features/notifications/syncScanReminders';
import { patchSettings } from '../api/settingsApi';

type ApplyOpts = {
  value: boolean;
  setLocal: (value: boolean) => void;
  apiLive: boolean;
  showToast: (message: string) => void;
  messages: {
    permissionDenied: string;
    unsupported: string;
    scheduleError: string;
    settingsSaveError: string;
  };
};

export async function applyScanReminderToggle(opts: ApplyOpts): Promise<void> {
  const sync = await syncScanReminders(opts.value);
  if (!sync.ok) {
    opts.setLocal(false);
    opts.showToast(messageForSyncFailure(sync.reason, opts.messages));
    if (opts.apiLive) {
      await patchSettingsSafe(false, opts);
    }
    return;
  }

  opts.setLocal(sync.enabled);
  if (opts.apiLive) {
    await patchSettingsSafe(sync.enabled, opts);
  }
}

async function patchSettingsSafe(enabled: boolean, opts: ApplyOpts): Promise<void> {
  try {
    await patchSettings({ notifyScanReminders: enabled });
  } catch {
    opts.setLocal(!enabled);
    opts.showToast(opts.messages.settingsSaveError);
    await syncScanReminders(!enabled);
  }
}

function messageForSyncFailure(
  reason: 'permission_denied' | 'unsupported' | 'schedule_error',
  messages: ApplyOpts['messages'],
): string {
  if (reason === 'permission_denied') {
    return messages.permissionDenied;
  }
  if (reason === 'unsupported') {
    return messages.unsupported;
  }
  return messages.scheduleError;
}
