import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { ProgressRing } from '@/src/components/ProgressRing';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import type { HomeRoutineProgress } from '../mock/homeMockScenarios';

export type HomeRoutineCardProps = {
  routine: HomeRoutineProgress;
  onContinue: () => void;
};

export function HomeRoutineCard({ routine, onContinue }: HomeRoutineCardProps) {
  const h = getCopy().screens.home;
  const common = getCopy().common;
  const progress = routine.amTotal > 0 ? (routine.amDone / routine.amTotal) * 100 : 0;
  const toGo = Math.max(0, routine.amTotal - routine.amDone);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <ProgressRing
          progress={progress}
          size={64}
          strokeWidth={6}
          label={`${String(routine.amDone)}/${String(routine.amTotal)}`}
        />
        <View style={styles.text}>
          <AppText variant="caption" color={colors.mute}>
            {h.routineTitle}
          </AppText>
          <AppText variant="bodyStrong">{h.routineStepsToGo(toGo)}</AppText>
        </View>
        <Button label={common.continue} variant="secondary" onPress={onContinue} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
