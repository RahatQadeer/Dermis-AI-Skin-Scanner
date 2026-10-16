import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { ProgressAreaChart } from './ProgressAreaChart';

export type ProgressIndexCardProps = {
  current: number;
  baseline: number;
  delta: number;
  days: number;
  values: readonly number[];
  startLabel: string;
};

export function ProgressIndexCard({
  current,
  baseline,
  delta,
  days,
  values,
  startLabel,
}: ProgressIndexCardProps) {
  const p = getCopy().screens.progress;

  return (
    <Card>
      <View style={styles.headRow}>
        <AppText variant="label" color={colors.mute}>
          {p.shiLabel}
        </AppText>
        <AppText variant="caption" color={colors.green}>
          {p.indexWindowDelta(delta, days)}
        </AppText>
      </View>
      <View style={styles.numRow}>
        <AppText variant="display" color={colors.ink}>
          {String(current)}
        </AppText>
        <AppText variant="body" color={colors.mute} style={styles.from}>
          {p.fromLabel(baseline)}
        </AppText>
      </View>
      <ProgressAreaChart values={values} startLabel={startLabel} endLabel={p.todayLabel} />
    </Card>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  from: {
    marginBottom: spacing.sm,
  },
});
