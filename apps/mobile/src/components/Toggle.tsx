import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme';

export type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

export function Toggle({ value, onChange, accessibilityLabel, disabled = false }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.pinkBright : colors.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    minWidth: 44,
    height: 32,
    minHeight: 44,
    borderRadius: radii.pill,
    padding: spacing.xxs,
    justifyContent: 'center',
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
});
