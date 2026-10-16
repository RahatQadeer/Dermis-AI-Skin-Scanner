import { getCopy } from '@/src/copy';

import { weeklyScanReminderTrigger } from './lib/reminderSchedule';
import {
  cancelScanReminders,
  requestNotificationPermission,
  scheduleWeeklyScanReminder,
  type NotificationPermissionStatus,
} from './notificationsApi';

export type SyncScanRemindersResult =
  | { ok: true; enabled: boolean }
  | { ok: false; reason: 'permission_denied' | 'unsupported' | 'schedule_error' };

export async function syncScanReminders(enabled: boolean): Promise<SyncScanRemindersResult> {
  if (!enabled) {
    await cancelScanReminders();
    return { ok: true, enabled: false };
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return { ok: false, reason: permissionReason(permission) };
  }

  const copy = getCopy().screens.profile;
  const scheduled = await scheduleWeeklyScanReminder(
    { title: copy.reminderTitle, body: copy.reminderBody },
    weeklyScanReminderTrigger(),
  );

  if (scheduled === 'scheduled') {
    return { ok: true, enabled: true };
  }
  if (scheduled === 'unsupported') {
    return { ok: false, reason: 'unsupported' };
  }
  return { ok: false, reason: 'schedule_error' };
}

function permissionReason(
  status: NotificationPermissionStatus,
): 'permission_denied' | 'unsupported' {
  return status === 'unsupported' ? 'unsupported' : 'permission_denied';
}
