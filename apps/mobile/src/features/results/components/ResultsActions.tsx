import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing, touchTargets } from '@/src/theme';

export type ResultsActionsProps = {
  onCompare: () => void;
  onUpdateRoutine: () => void;
};

export function ResultsActions({ onCompare, onUpdateRoutine }: ResultsActionsProps) {
  const r = getCopy().screens.results;
  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={r.compareCta}
        onPress={onCompare}
        style={({ pressed }) => [styles.compare, pressed && styles.pressed]}
      >
        <AppText variant="bodyStrong" color={colors.ink} align="center" style={styles.label}>
          {r.compareCta}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={r.updateRoutineCta}
        onPress={onUpdateRoutine}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <AppText variant="bodyStrong" color={colors.surface} align="center" style={styles.label}>
          {r.updateRoutineCta}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  compare: {
    flex: 1,
    minHeight: touchTargets.min + 4,
    borderRadius: radii.pill,
    backgroundColor: colors.resultsCanvas,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primary: {
    flex: 1,
    minHeight: touchTargets.min + 4,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontFamily: fontFamilies.bodyBold,
  },
});
