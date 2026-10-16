import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export type EditButtonProps = {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function EditButton({ active, disabled = false, onPress }: EditButtonProps) {
  const r = getCopy().screens.routine;
  const label = active ? r.editDone : r.editAction;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        active ? styles.pillActive : styles.pillIdle,
        { opacity: pressed || disabled ? 0.85 : 1 },
      ]}
    >
      <AppText variant="bodyStrong" color={active ? colors.surface : colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
});
