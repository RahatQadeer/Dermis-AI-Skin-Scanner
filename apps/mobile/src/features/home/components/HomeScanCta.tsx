import type { Plan } from '@dermis/domain/server';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export type HomeScanCtaProps = {
  plan: Plan;
  onPress: () => void;
};

function RecordIcon() {
  return (
    <View style={styles.record}>
      <View style={styles.recordInner} />
    </View>
  );
}

export function HomeScanCta({ plan, onPress }: HomeScanCtaProps) {
  const h = getCopy().screens.home;
  const label = plan === 'free' ? h.startScanCta : h.startScanProCta;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.cta, pressed ? styles.pressed : null]}
    >
      <RecordIcon />
      <AppText variant="bodyStrong" color={colors.surface}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: spacing.huge,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
  record: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radii.pill,
    backgroundColor: colors.pinkBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
});
