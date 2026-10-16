import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, radii, spacing } from '@/src/theme';

export type AuthPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/** Dark pill CTA with trailing arrow; light-green disabled state (auth refs). */
export function AuthPrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const textColor = isDisabled ? colors.muteFoot : colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={(state) => [
        styles.base,
        { backgroundColor: isDisabled ? colors.quizContinueDisabled : colors.ink },
        state.pressed && !isDisabled ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          <AppText variant="bodyStrong" color={textColor}>
            {label}
          </AppText>
          <AppText variant="bodyStrong" color={textColor}>
            →
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: spacing.huge,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
