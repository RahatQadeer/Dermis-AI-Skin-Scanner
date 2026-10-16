const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** "2026-08-20" → "20 Aug". Returns the input unchanged if unparseable. */
export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day || month < 1 || month > 12) {
    return iso;
  }
  return `${String(day)} ${MONTHS[month - 1]}`;
}
