import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, radii, spacing } from '@/src/theme';

export type AnalysingStepsProps = {
  steps: readonly string[];
  activeStep: number;
};

export function AnalysingSteps({ steps, activeStep }: AnalysingStepsProps) {
  return (
    <View style={styles.list} accessibilityRole="list">
      {steps.map((label, index) => {
        const done = index <= activeStep;
        return (
          <View key={label} style={styles.row} accessibilityRole="text">
            <View style={[styles.check, done ? styles.checkDone : styles.checkPending]}>
              {done ? (
                <AppText variant="caption" color={colors.surface}>
                  ✓
                </AppText>
              ) : null}
            </View>
            <AppText variant="body" color={done ? colors.surface : colors.borderMuted}>
              {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const CHECK = 28;

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.green,
  },
  checkPending: {
    borderWidth: 2,
    borderColor: colors.mute,
  },
});
