import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';

export type ScreenProps = {
  children: ReactNode;
  /** When true, wraps children in a vertical ScrollView. */
  scroll?: boolean;
  /** Horizontal + vertical content padding (default true). */
  padded?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
};

const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right', 'bottom'];

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = DEFAULT_EDGES,
  style,
  contentStyle,
  testID,
}: ScreenProps) {
  const padStyle = padded ? styles.padded : undefined;

  return (
    <SafeAreaView edges={edges} style={[styles.root, style]} testID={testID}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, padStyle, contentStyle]}
          keyboardShouldPersistTaps="handled"
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
        <View style={[styles.body, padStyle, contentStyle]}>{children}</View>
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
});
