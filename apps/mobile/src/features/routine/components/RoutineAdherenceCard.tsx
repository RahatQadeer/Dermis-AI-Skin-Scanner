import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export function RoutineAdherenceCard() {
  const r = getCopy().screens.routine;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <AppText variant="label" color={colors.cream}>
          {r.adherenceLabel}
        </AppText>
        <AppText variant="caption" color={colors.cream} align="right" style={styles.note}>
          {r.adherenceNote}
        </AppText>
      </View>
      <AppText variant="display" color={colors.surface}>
        {r.adherenceValue}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  note: {
    flex: 1,
  },
});
