import { colors } from './colors';
import { motion } from './motion';
import { radii } from './radii';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { touchTargets } from './touchTargets';
import { fontFamilies, fontSizes, lineHeights, textStyles } from './typography';

export { colors, type ColorToken } from './colors';
export { motion } from './motion';
export { radii, type RadiusToken } from './radii';
export { clampFont, scaleHeight, type Responsive } from './responsive';
export { useResponsive } from './useResponsive';
export { shadows } from './shadows';
export { spacing, type SpacingToken } from './spacing';
export { touchTargets } from './touchTargets';
export { fontFamilies, fontSizes, lineHeights, textStyles } from './typography';

export const theme = {
  colors,
  spacing,
  radii,
  fontFamilies,
  fontSizes,
  lineHeights,
  textStyles,
  shadows,
  motion,
  touchTargets,
} as const;

export type Theme = typeof theme;
