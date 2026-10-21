import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PartyConfetti } from '@/src/components/celebration/PartyConfetti';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useFloatingBannerMotion } from '@/src/lib/useFloatingBannerMotion';
import { colors, fontFamilies, radii, shadows, spacing } from '@/src/theme';

export type RoutineCompleteBannerProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
};

function CompletePill({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const c = getCopy().feedback;
  return (
    <View style={styles.pill} accessibilityRole="alert">
      <View style={styles.sheep}>
        <Mascot character="dermis" mood="happy" size={36} showBubble={false} />
      </View>
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
  );
}

/** Celebration pill when every step in the period is done — sits above the tab bar. */
export function RoutineCompleteBanner({
  message,
  visible,
  onDismiss,
  durationMs = 3200,
}: RoutineCompleteBannerProps) {
  const insets = useSafeAreaInsets();
  const r = getCopy().screens.routine;
  const bottom = TAB_BAR_SCROLL_PAD + (insets.bottom > 0 ? spacing.sm : spacing.md);
  const animatedStyle = useFloatingBannerMotion({
    visible,
    durationMs,
    onDismiss,
    hiddenOffsetY: 20,
  });
  if (!visible) return null;
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <PartyConfetti active burstKey={message} />
      <Animated.View
        pointerEvents="box-none"
        style={[styles.host, { bottom }, animatedStyle]}
        accessibilityLiveRegion="polite"
        accessibilityLabel={r.toastRoutineCompleteA11y}
      >
        <CompletePill message={message} onDismiss={onDismiss} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 220,
    elevation: 220,
  },
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.pinkBright,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    minHeight: 56,
    ...shadows.card,
    shadowColor: colors.pink,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 14,
  },
  sheep: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  message: {
    flex: 1,
    fontFamily: fontFamilies.bodyBold,
  },
  dismiss: {
    minWidth: 40,
    minHeight: 40,
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
