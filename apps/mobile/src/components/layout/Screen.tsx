import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useScreenLayout } from './useScreenLayout';

export type ScreenProps = {
  children: ReactNode;
  /** When true, wraps children in a vertical ScrollView. */
  scroll?: boolean;
  /** Horizontal + vertical content padding (default true). */
  padded?: boolean;
  /**
   * Extra bottom space so the last content clears the floating tab bar.
   * Use on Home / Progress / Routine / Profile (and similar) scroll screens.
   */
  tabBarPadding?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right', 'bottom'];

export function Screen({
  children,
  scroll = false,
  padded = true,
  tabBarPadding = false,
  edges = DEFAULT_EDGES,
  style,
  contentStyle,
  testID,
}: ScreenProps) {
  const { rootStyle, bodyStyle, scrollStyle } = useScreenLayout({
    padded,
    tabBarPadding,
    style,
    contentStyle,
  });

  return (
    <SafeAreaView edges={edges} style={rootStyle} testID={testID}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
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
          >
            {children}
          </ScrollView>
        ) : (
          <View style={bodyStyle}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
