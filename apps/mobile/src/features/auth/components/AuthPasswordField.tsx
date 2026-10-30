import { passwordStrength } from '@dermis/domain';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing, textStyles } from '@/src/theme';

const BAR_COUNT = 4;

export type AuthPasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  /** Show the 4-segment strength meter + hint line (sign up only). */
  showMeter?: boolean;
  hint?: string;
  textContentType?: 'password' | 'newPassword';
  returnKeyType?: 'go' | 'done' | 'next';
  onSubmitEditing?: () => void;
};

export function AuthPasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  showMeter = false,
  hint,
  textContentType = 'password',
  returnKeyType,
  onSubmitEditing,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color={colors.mute}>
        {label}
      </AppText>
      <View style={[styles.field, { borderColor: error ? colors.red : colors.border }]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={styles.input}
        />
        <ShowToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
      </View>
      {showMeter ? (
        <StrengthMeter value={value} error={error} hint={hint} />
      ) : error ? (
        <AppText variant="caption" color={colors.red}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function ShowToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  const inputs = getCopy().inputs;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? inputs.hidePasswordA11y : inputs.showPasswordA11y}
      onPress={onToggle}
      style={styles.toggle}
      hitSlop={spacing.sm}
    >
      <AppText variant="caption" color={colors.ink}>
        {visible ? inputs.hidePassword : inputs.showPassword}
      </AppText>
    </Pressable>
  );
}

function StrengthMeter({ value, error, hint }: { value: string; error?: string; hint?: string }) {
  const score = passwordStrength(value).score;
  return (
    <View style={styles.meter} accessibilityRole="summary">
      <View style={styles.bars}>
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { backgroundColor: index < score ? barColor(score) : colors.border },
            ]}
          />
        ))}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.red}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.muteFoot}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function barColor(score: number): string {
  if (score <= 1) return colors.red;
  if (score === 2) return colors.amber;
  if (score === 3) return colors.sky;
  return colors.green;
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing.huge,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.ink,
    ...textStyles.body,
  },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
  },
  meter: {
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bar: {
    flex: 1,
    height: spacing.xs,
    borderRadius: radii.sm,
  },
});
