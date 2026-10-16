import { colors } from '@/src/theme';

/**
 * Dark paywall palette. Translucent whites compose over the ink background
 * (no new theme tokens needed; rgba is allowed by the no-hex lint rule).
 */
export const paywallDark = {
  bg: colors.ink,
  card: 'rgba(255, 255, 255, 0.06)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  closeBg: 'rgba(255, 255, 255, 0.12)',
} as const;
