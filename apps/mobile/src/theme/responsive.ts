/**
 * Pure responsive helpers (no react-native import, so they're unit-testable
 * under the node test runner). The `useResponsive` hook lives in
 * `./useResponsive` and reuses these.
 */

/** Devices at/below these are treated as small (iPhone SE, older Androids). */
export const SHORT_SCREEN_HEIGHT = 700;
export const NARROW_SCREEN_WIDTH = 360;
/** Reference width (~iPhone 14) that fixed font sizes were designed against. */
const REFERENCE_WIDTH = 390;

export type Responsive = {
  width: number;
  height: number;
  /** Height ≤ 700dp — vertical space is tight (SE 568/667). */
  short: boolean;
  /** Width < 360dp — horizontal space is tight (SE 320/375). */
  narrow: boolean;
};

/**
 * Caps a fixed element height to a fraction of the viewport so large hero bands
 * don't swallow short screens. Returns `base` when the viewport is tall enough.
 */
export function scaleHeight(base: number, viewportHeight: number, maxFraction: number): number {
  return Math.min(base, Math.round(viewportHeight * maxFraction));
}

/**
 * Shrinks an oversized font proportionally on narrow screens. Never exceeds
 * `base` (normal/large phones keep the designed size) and never drops below
 * `min` (default 80% of base).
 */
export function clampFont(base: number, viewportWidth: number, min = base * 0.8): number {
  const scaled = (viewportWidth / REFERENCE_WIDTH) * base;
  return Math.round(Math.max(min, Math.min(base, scaled)));
}
