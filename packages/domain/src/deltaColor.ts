/** Semantic delta colour for UI tokens. */
export type DeltaColorToken = 'green' | 'red' | 'mute';

/**
 * Display helper: positive → green, negative → red, zero → mute.
 * Safe for the mobile app.
 */
export function deltaColor(delta: number): DeltaColorToken {
  if (!Number.isFinite(delta) || delta === 0) {
    return 'mute';
  }
  return delta > 0 ? 'green' : 'red';
}
