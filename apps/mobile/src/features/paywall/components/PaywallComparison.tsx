import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export function PaywallComparison() {
  const p = getCopy().paywall;

  return (
    <View style={styles.block}>
      <AppText variant="headline">{p.compareTitle}</AppText>
      <View style={styles.row}>
        <Card style={styles.col}>
          <AppText variant="bodyStrong">{p.compareFreeTitle}</AppText>
          {p.compareFreeItems.map((item) => (
            <AppText key={item} variant="caption" color={colors.mute}>
              {item}
            </AppText>
          ))}
        </Card>
        <Card style={styles.col}>
          <AppText variant="bodyStrong" color={colors.green}>
            {p.compareProTitle}
          </AppText>
          {p.compareProItems.map((item) => (
            <AppText key={item} variant="caption" color={colors.ink}>
              {item}
            </AppText>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
    gap: spacing.xs,
  },
});
