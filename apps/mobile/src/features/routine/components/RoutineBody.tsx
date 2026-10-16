import { StyleSheet, View } from 'react-native';

import { spacing } from '@/src/theme';

import type { useRoutineFlow } from '../hooks/useRoutineFlow';
import { AddStepButton } from './AddStepButton';
import { PeriodTabs } from './PeriodTabs';
import { RoutineAdherenceCard } from './RoutineAdherenceCard';
import { RoutineProgressCard } from './RoutineProgressCard';
import { RoutineRecommendedCta } from './RoutineRecommendedCta';
import { RoutineStepList } from './RoutineStepList';

export type RoutineBodyProps = {
  flow: ReturnType<typeof useRoutineFlow>;
  unlocked: boolean;
  editing: boolean;
};

export function RoutineBody({ flow, unlocked, editing }: RoutineBodyProps) {
  return (
    <View style={styles.stack}>
      <PeriodTabs value={flow.period} onChange={flow.setPeriod} disabled={!unlocked} />
      <RoutineProgressCard
        period={flow.period}
        done={flow.doneCount}
        total={flow.steps.length}
        editing={editing}
      />
      <RoutineStepList
        steps={flow.steps}
        editing={editing}
        onToggle={flow.onToggle}
        onRemove={flow.onRemove}
      />
      <AddStepButton onPress={flow.openAdd} disabled={!unlocked} />
      <RoutineAdherenceCard />
      <RoutineRecommendedCta />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
});
