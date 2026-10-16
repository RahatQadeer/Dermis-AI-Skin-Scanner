import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import type { RoutineStep } from '../types/routineTypes';
import { RoutineStepRow } from './RoutineStepRow';

export type RoutineStepListProps = {
  steps: RoutineStep[];
  editing: boolean;
  onToggle: (stepId: string) => void;
  onRemove: (stepId: string) => void;
};

export function RoutineStepList({ steps, editing, onToggle, onRemove }: RoutineStepListProps) {
  const r = getCopy().screens.routine;

  if (steps.length === 0) {
    return (
      <AppText variant="body" color={colors.mute}>
        {r.emptyPeriod}
      </AppText>
    );
  }

  return (
    <View style={styles.list}>
      {steps.map((step) => (
        <RoutineStepRow
          key={step.id}
          step={step}
          editing={editing}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
