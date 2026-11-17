import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/src/theme';
import { useResponsive } from '@/src/theme/useResponsive';

import { useTabBarScrollPad } from './useTabBarScrollPad';

/** Keep tablet/wide layouts readable instead of full-bleed stretch. */
const CONTENT_MAX_WIDTH = 560;

type ScreenLayoutOptions = {
  padded: boolean;
  tabBarPadding: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

type ScreenLayoutStyles = {
  rootStyle: StyleProp<ViewStyle>;
  bodyStyle: StyleProp<ViewStyle>;
  scrollStyle: StyleProp<ViewStyle>;
};

function resolvePadStyle(padded: boolean, narrow: boolean, short: boolean) {
  if (!padded) {
    return undefined;
  }
  return [
    layoutStyles.paddedX,
    narrow ? layoutStyles.paddedNarrow : null,
    short ? layoutStyles.paddedTopShort : layoutStyles.paddedTop,
  ];
}

function resolveConstrain(width: number) {
  return width > CONTENT_MAX_WIDTH
    ? ({ maxWidth: CONTENT_MAX_WIDTH, width: '100%', alignSelf: 'center' } as const)
    : undefined;
}

/** Tab screens: device-aware clearance. Others: tight trail so content stays sticky. */
function resolveBottomPad(tabBarPadding: boolean, tabPad: number, short: boolean): number {
  if (tabBarPadding) {
    return tabPad;
  }
  return short ? spacing.sm : spacing.md;
}

export function useScreenLayout({
  padded,
  tabBarPadding,
  style,
  contentStyle,
}: ScreenLayoutOptions): ScreenLayoutStyles {
  const { width, narrow, short } = useResponsive();
  const tabPad = useTabBarScrollPad();

  const padStyle = resolvePadStyle(padded, narrow, short);
  const constrain = resolveConstrain(width);
  const bottomPad = resolveBottomPad(tabBarPadding, tabPad, short);

  // RN 0.88 ColorValue typing diverges from safe-area-context; cast keeps callers typed.
  const rootStyle = [layoutStyles.root, style] as StyleProp<ViewStyle>;
  const bodyStyle = [
    layoutStyles.body,
    padStyle,
    constrain,
    contentStyle,
    tabBarPadding ? { paddingBottom: bottomPad } : null,
  ] as StyleProp<ViewStyle>;
  const scrollStyle = [
    layoutStyles.scrollContent,
    padStyle,
    constrain,
    contentStyle,
    // Applied last so tab/keyboard clearance is never overwritten by contentStyle.
    { paddingBottom: bottomPad },
  ] as StyleProp<ViewStyle>;

  return { rootStyle, bodyStyle, scrollStyle };
}

export const layoutStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  paddedX: {
    paddingHorizontal: spacing.lg,
  },
  paddedNarrow: {
    paddingHorizontal: spacing.md,
  },
  paddedTop: {
    paddingTop: spacing.sm,
  },
  paddedTopShort: {
    paddingTop: spacing.xs,
  },
});
