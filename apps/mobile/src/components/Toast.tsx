import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useFloatingBannerMotion } from '@/src/lib/useFloatingBannerMotion';
import { colors, fontFamilies, motion, radii, shadows, spacing } from '@/src/theme';

import { TAB_BAR_SCROLL_PAD } from './layout/tabBarTypes';

export type ToastProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  /** Defaults to theme toast duration (2600 ms). */
  durationMs?: number;
};

export function Toast({
  message,
  visible,
  onDismiss,
  durationMs = motion.duration.toast,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const c = getCopy().feedback;
  const bottom = TAB_BAR_SCROLL_PAD + (insets.bottom > 0 ? spacing.sm : spacing.md);
  const animatedStyle = useFloatingBannerMotion({ visible, durationMs, onDismiss });

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.host, { bottom }, animatedStyle]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.toast} accessibilityRole="alert">
        <View style={styles.accent} />
        <AppText variant="bodyStrong" color={colors.surface} style={styles.message}>
          {message}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={c.toastDismissA11y}
          onPress={onDismiss}
          hitSlop={spacing.sm}
          style={styles.dismiss}
        >
          <AppText variant="caption" color={colors.surface} style={styles.dismissLabel}>
            {getCopy().common.close}
          </AppText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 120,
    elevation: 120,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.pinkBright,
    overflow: 'hidden',
    ...shadows.card,
    shadowColor: colors.pink,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.pinkBright,
  },
  message: {
    flex: 1,
    paddingLeft: spacing.xs,
    fontFamily: fontFamilies.bodySemiBold,
  },
  dismiss: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
  },
  dismissLabel: {
    fontFamily: fontFamilies.bodySemiBold,
  },
});
