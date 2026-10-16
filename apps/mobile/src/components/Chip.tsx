import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, radii, spacing, touchTargets } from '@/src/theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
} & Pick<ViewProps, 'style' | 'testID'>;

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: ChipProps) {
  const interactive = Boolean(onPress) && !disabled;
  const backgroundColor = selected ? colors.green : colors.surface;
  const textColor = selected ? colors.surface : colors.ink;
  const borderColor = selected ? colors.green : colors.border;

  const content = (
    <View
      testID={testID}
      style={[styles.base, { backgroundColor, borderColor, opacity: disabled ? 0.45 : 1 }, style]}
    >
      <AppText variant="caption" color={textColor}>
        {label}
      </AppText>
    </View>
  );

  if (!interactive) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTargets.min,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
