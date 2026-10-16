/** Corner radii. */
export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  /** Welcome / prototype soft cards. */
  card: 18,
  xl: 22,
  /** Results / prototype large cards. */
  xxl: 28,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radii;
