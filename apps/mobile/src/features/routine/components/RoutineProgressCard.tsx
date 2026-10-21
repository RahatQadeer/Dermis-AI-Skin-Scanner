import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { ProgressRing } from '@/src/components/ProgressRing';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import type { RoutinePeriod } from '../types/routineTypes';

export type RoutineProgressCardProps = {
  period: RoutinePeriod;
  done: number;
  total: number;
  editing?: boolean;
};

export function RoutineProgressCard({
  period,
  done,
  total,
  editing = false,
}: RoutineProgressCardProps) {
  const r = getCopy().screens.routine;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;
  const title =
    editing && allDone ? r.allDoneTitle : period === 'am' ? r.routineTitleAm : r.routineTitlePm;
  const subtitle = editing
    ? r.editRemoveHint
    : `${r.toGo(total - done)} · ${period === 'am' ? r.focusAm : r.focusPm}`;

  return (
    <View style={styles.card}>
      <ProgressRing
        progress={pct}
        label={`${String(done)}/${String(total)}`}
        size={72}
        strokeWidth={7}
      />
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={colors.ink}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.muteBody}>
          {subtitle}
        </AppText>
      </View>
      <Mascot mood="happy" size={56} showBubble={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.hero,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
