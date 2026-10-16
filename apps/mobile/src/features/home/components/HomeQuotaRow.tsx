import { StyleSheet, Pressable, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';
import type { QuotaState } from '@dermis/domain/server';

export type HomeQuotaRowProps = {
  quota: QuotaState;
  onUpgrade: () => void;
};

const FREE_LIFETIME_LIMIT = 1;
const PRO_DAILY_LIMIT = 5;

function availableLine(quota: QuotaState): string {
  const h = getCopy().screens.home;
  if (quota.plan === 'free') {
    return h.scansAvailableFree(Math.max(0, FREE_LIFETIME_LIMIT - quota.lifetimeScanCount));
  }
  return h.scansAvailablePro(Math.max(0, PRO_DAILY_LIMIT - quota.dailyScanCount));
}

export function HomeQuotaRow({ quota, onUpgrade }: HomeQuotaRowProps) {
  const h = getCopy().screens.home;
  return (
    <Card accessibilityRole="summary">
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.dot} />
          <AppText variant="bodyStrong">{availableLine(quota)}</AppText>
        </View>
        {quota.plan === 'free' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={h.getMoreCta}
            onPress={onUpgrade}
            hitSlop={spacing.sm}
          >
            <AppText variant="bodyStrong" color={colors.pink}>
              {h.getMoreCta}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.pinkBright,
  },
});
