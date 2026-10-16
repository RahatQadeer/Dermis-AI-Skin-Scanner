import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing, touchTargets } from '@/src/theme';

import type { RoutineStep } from '../types/routineTypes';

export type RoutineStepRowProps = {
  step: RoutineStep;
  editing: boolean;
  onToggle: (stepId: string) => void;
  onRemove: (stepId: string) => void;
};

export function RoutineStepRow({ step, editing, onToggle, onRemove }: RoutineStepRowProps) {
  const r = getCopy().screens.routine;

  return (
    <View style={styles.card}>
      {editing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={r.removeStepA11y(step.label)}
          onPress={() => onRemove(step.id)}
          hitSlop={spacing.sm}
          style={({ pressed }) => [styles.minusBtn, pressed && styles.pressed]}
        >
          <AppText variant="headline" color={colors.surface} style={styles.minusGlyph}>
            −
          </AppText>
        </Pressable>
      ) : (
        <CheckCircle done={step.done} label={step.label} onPress={() => onToggle(step.id)} />
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            variant="bodyStrong"
            color={!editing && step.done ? colors.mute : colors.ink}
            style={!editing && step.done ? styles.struck : undefined}
          >
            {step.label}
          </AppText>
          {step.duration ? (
            <AppText variant="caption" color={colors.mute}>
              {step.duration}
            </AppText>
          ) : null}
        </View>
        {step.detail ? (
          <AppText variant="caption" color={colors.mute}>
            {step.detail}
          </AppText>
        ) : null}
        {step.concern ? <ConcernChip label={step.concern} /> : null}
      </View>
    </View>
  );
}

function CheckCircle({
  done,
  label,
  onPress,
}: {
  done: boolean;
  label: string;
  onPress: () => void;
}) {
  const r = getCopy().screens.routine;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={r.toggleStepA11y(label, done)}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={[styles.check, done ? styles.checkDone : styles.checkOpen]}
    >
      {done ? (
        <AppText variant="caption" color={colors.surface}>
          ✓
        </AppText>
      ) : null}
    </Pressable>
  );
}

function ConcernChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="caption" color={colors.greenDeep}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxs,
  },
  checkDone: {
    backgroundColor: colors.green,
  },
  checkOpen: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  minusBtn: {
    width: touchTargets.min - 16,
    height: touchTargets.min - 16,
    borderRadius: radii.pill,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxs,
  },
  minusGlyph: {
    lineHeight: 22,
    marginTop: -2,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
});
