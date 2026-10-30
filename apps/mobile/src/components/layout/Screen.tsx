import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';
import { useResponsive } from '@/src/theme/useResponsive';

export type ScreenProps = {
  children: ReactNode;
  /** When true, wraps children in a vertical ScrollView. */
  scroll?: boolean;
  /** Horizontal + vertical content padding (default true). */
  padded?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right', 'bottom'];
/** Keep tablet/wide layouts readable instead of full-bleed stretch. */
const CONTENT_MAX_WIDTH = 560;

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = DEFAULT_EDGES,
  style,
  contentStyle,
  testID,
}: ScreenProps) {
  const { width, narrow, short } = useResponsive();
  const padStyle = padded
    ? [styles.padded, narrow ? styles.paddedNarrow : null, short ? styles.paddedShort : null]
    : undefined;
  const constrain =
    width > CONTENT_MAX_WIDTH
      ? ({ maxWidth: CONTENT_MAX_WIDTH, width: '100%', alignSelf: 'center' } as const)
      : undefined;

  // RN 0.88 ColorValue typing diverges from safe-area-context; cast keeps callers typed.
  const rootStyle = [styles.root, style] as StyleProp<ViewStyle>;
  const bodyStyle = [styles.body, padStyle, constrain, contentStyle] as StyleProp<ViewStyle>;
  const scrollStyle = [styles.scrollContent, padStyle, constrain, contentStyle] as StyleProp<ViewStyle>;

  return (
    <SafeAreaView edges={edges} style={rootStyle} testID={testID}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={scrollStyle}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          alwaysBounceVertical={false}
          alwaysBounceHorizontal={false}
          overScrollMode="never"
          removeClippedSubviews
        >
          {children}
        </ScrollView>
      ) : (
        <View style={bodyStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  padded: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  paddedNarrow: {
    paddingHorizontal: spacing.md,
  },
  paddedShort: {
    paddingVertical: spacing.sm,
  },
});
