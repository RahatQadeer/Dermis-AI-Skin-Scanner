import type { WeeklyReminderTrigger } from './lib/reminderSchedule';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export type ScanReminderContent = {
  title: string;
  body: string;
};

/** Default (web / typecheck): native overrides via `notificationsApi.native.ts`. */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  return 'unsupported';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  return 'unsupported';
}

export async function ensureAndroidReminderChannel(): Promise<void> {}

export async function scheduleWeeklyScanReminder(
  _content: ScanReminderContent,
  _trigger: WeeklyReminderTrigger,
): Promise<'scheduled' | 'unsupported' | 'error'> {
  return 'unsupported';
}

export async function cancelScanReminders(): Promise<void> {}
