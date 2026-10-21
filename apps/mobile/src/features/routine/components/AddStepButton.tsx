import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export type AddStepButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

export function AddStepButton({ onPress, disabled = false }: AddStepButtonProps) {
  const r = getCopy().screens.routine;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={r.addStep}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }]}
    >
      <View style={styles.plus}>
        <AppText variant="bodyStrong" color={colors.surface}>
          +
        </AppText>
      </View>
      <AppText variant="bodyStrong" color={colors.ink}>
        {r.addStep}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: spacing.huge,
    borderRadius: radii.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  plus: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pinkBright,
  },
});
