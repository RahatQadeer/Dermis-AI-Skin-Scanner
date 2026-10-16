import { StyleSheet, TextInput, View, type TextInputProps, type TextStyle } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, radii, spacing, textStyles } from '@/src/theme';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  editable = true,
  style,
  accessibilityLabel,
  ...rest
}: TextFieldProps) {
  const disabled = editable === false;
  const borderColor = error ? colors.red : colors.border;

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="caption" color={colors.mute}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label ?? rest.placeholder ?? 'Text field'}
        editable={editable}
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, { borderColor, opacity: disabled ? 0.5 : 1 }, style as TextStyle]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color={colors.red}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.mute}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    color: colors.ink,
    ...textStyles.body,
  },
});
