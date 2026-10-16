import { passwordStrength } from '@dermis/domain';
import { useState } from 'react';
import { StyleSheet, View, type TextInputProps } from 'react-native';

import { IconButton } from '@/src/components/IconButton';
import { PasswordStrengthMeter } from '@/src/components/PasswordStrengthMeter';
import { TextField } from '@/src/components/TextField';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type PasswordFieldProps = Omit<TextInputProps, 'secureTextEntry' | 'value'> & {
  label: string;
  value: string;
  error?: string;
  showStrength?: boolean;
};

export function PasswordField({
  label,
  value,
  error,
  showStrength = true,
  onChangeText,
  ...rest
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const c = getCopy().inputs;
  const strength = passwordStrength(value);
  const toggleLabel = visible ? c.hidePasswordA11y : c.showPasswordA11y;
  const toggleText = visible ? c.hidePassword : c.showPassword;

  return (
    <View style={styles.wrap}>
      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <TextField
            label={label}
            value={value}
            error={error}
            onChangeText={onChangeText}
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            {...rest}
          />
        </View>
        <IconButton
          accessibilityLabel={toggleLabel}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <AppText variant="caption" color={colors.ink}>
            {toggleText}
          </AppText>
        </IconButton>
      </View>
      {showStrength ? (
        <PasswordStrengthMeter
          score={strength.score}
          label={strength.label}
          checks={strength.checks}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  toggle: {
    marginTop: spacing.lg,
  },
});
