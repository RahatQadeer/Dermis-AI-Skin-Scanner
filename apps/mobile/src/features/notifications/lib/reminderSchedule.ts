import { SCAN_REMINDER_HOUR, SCAN_REMINDER_MINUTE, SCAN_REMINDER_WEEKDAY } from '../constants';

export type WeeklyReminderTrigger = {
  weekday: number;
  hour: number;
  minute: number;
};

/** Local weekly scan-reminder schedule (product default until cadence is finalized). */
export function weeklyScanReminderTrigger(): WeeklyReminderTrigger {
  return {
    weekday: SCAN_REMINDER_WEEKDAY,
    hour: SCAN_REMINDER_HOUR,
    minute: SCAN_REMINDER_MINUTE,
  };
}

export function isValidWeekday(weekday: number): boolean {
  return Number.isInteger(weekday) && weekday >= 1 && weekday <= 7;
}
