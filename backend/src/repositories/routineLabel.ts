const MAX_LABEL = 80;

/** Trimmed 1–80 char step label; throws invalid_label otherwise. */
export function normalizeRoutineLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_LABEL) {
    throw new Error('invalid_label');
  }
  return trimmed;
}
