import { Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/src/components/TextField';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing, touchTargets } from '@/src/theme';

export function RoutineStepCustomRow(props: {
  draftLabel: string;
  labelError?: string;
  onChangeLabel: (value: string) => void;
  onSave: () => void;
}) {
  const r = getCopy().screens.routine;
  return (
    <>
      <AppText variant="caption" color={colors.muteFoot} style={styles.sectionEyebrow}>
        {r.customStepHeading}
      </AppText>
      <View style={styles.customRow}>
        <View style={styles.customField}>
          <TextField
            placeholder={r.stepLabelPlaceholder}
            value={props.draftLabel}
            onChangeText={props.onChangeLabel}
            error={props.labelError}
            accessibilityLabel={r.stepLabelField}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={r.addCustomCta}
          onPress={props.onSave}
          style={({ pressed }) => [styles.addCustomBtn, pressed && styles.pressed]}
        >
          <AppText variant="bodyStrong" color={colors.ink}>
            {r.addCustomCta}
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionEyebrow: {
    letterSpacing: 0.7,
    marginTop: spacing.xs,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  customField: {
    flex: 1,
  },
  addCustomBtn: {
    minHeight: touchTargets.min,
    borderRadius: radii.pill,
    backgroundColor: colors.hero,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
});
