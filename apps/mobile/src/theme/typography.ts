import type { TextStyle } from 'react-native';

/** Font family names must match loaded Expo Google Fonts. */
export const fontFamilies = {
  heading: 'Fredoka_600SemiBold',
  headingBold: 'Fredoka_700Bold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtraBold: 'Nunito_800ExtraBold',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  display: 40,
} as const;

export const lineHeights = {
  tight: 1.15,
  normal: 1.4,
  relaxed: 1.65,
} as const;

export const textStyles = {
  display: {
    fontFamily: fontFamilies.headingBold,
    fontSize: fontSizes.display,
    lineHeight: fontSizes.display * lineHeights.tight,
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xxl,
    lineHeight: fontSizes.xxl * lineHeights.tight,
  },
  headline: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  bodyStrong: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  caption: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  label: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: 0.6,
  },
} as const satisfies Record<string, TextStyle>;
