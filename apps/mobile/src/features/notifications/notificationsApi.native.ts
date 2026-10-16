import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { SCAN_REMINDER_CHANNEL_ID, SCAN_REMINDER_NOTIFICATION_ID } from './constants';
import type { WeeklyReminderTrigger } from './lib/reminderSchedule';
import type { NotificationPermissionStatus, ScanReminderContent } from './notificationsApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const current = await Notifications.getPermissionsAsync();
  return mapStatus(current.status);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return 'granted';
  }
  if (!current.canAskAgain && current.status === 'denied') {
    return 'denied';
  }
  const next = await Notifications.requestPermissionsAsync();
  return mapStatus(next.status);
}

export async function ensureAndroidReminderChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(SCAN_REMINDER_CHANNEL_ID, {
    name: 'Scan reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function scheduleWeeklyScanReminder(
  content: ScanReminderContent,
  trigger: WeeklyReminderTrigger,
): Promise<'scheduled' | 'unsupported' | 'error'> {
  try {
    await ensureAndroidReminderChannel();
    await Notifications.cancelScheduledNotificationAsync(SCAN_REMINDER_NOTIFICATION_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: SCAN_REMINDER_NOTIFICATION_ID,
      content: {
        title: content.title,
        body: content.body,
        ...(Platform.OS === 'android' ? { channelId: SCAN_REMINDER_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: trigger.weekday,
        hour: trigger.hour,
        minute: trigger.minute,
      },
    });
    return 'scheduled';
  } catch {
    return 'error';
  }
}

export async function cancelScanReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(SCAN_REMINDER_NOTIFICATION_ID);
}

function mapStatus(status: Notifications.PermissionStatus): NotificationPermissionStatus {
  if (status === 'granted') {
    return 'granted';
  }
  if (status === 'denied') {
    return 'denied';
  }
  return 'undetermined';
}
