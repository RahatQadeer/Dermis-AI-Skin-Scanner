import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import type { ProgressWindow } from '../types/progressTypes';

export type ProgressWindowToggleProps = {
  value: ProgressWindow;
  onChange: (value: ProgressWindow) => void;
  disabled?: boolean;
};

export function ProgressWindowToggle({
  value,
  onChange,
  disabled = false,
}: ProgressWindowToggleProps) {
  const p = getCopy().screens.progress;
  const options: { value: ProgressWindow; label: string }[] = [
    { value: '30', label: p.window30Short },
    { value: '90', label: p.window90Short },
  ];

  return (
    <View
      style={[styles.track, disabled ? styles.disabled : null]}
      accessibilityRole="tablist"
      accessibilityLabel={p.windowA11y}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={option.label}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected ? styles.segmentSelected : styles.segmentIdle]}
          >
            <AppText
              variant="caption"
              color={selected ? colors.surface : colors.ink}
              style={selected ? styles.labelSelected : styles.labelIdle}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
    padding: spacing.xxs,
    gap: spacing.xxs,
  },
  segment: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  segmentSelected: {
    backgroundColor: colors.ink,
  },
  segmentIdle: {
    backgroundColor: colors.cream,
  },
  labelSelected: {
    fontFamily: fontFamilies.bodyBold,
  },
  labelIdle: {
    fontFamily: fontFamilies.bodySemiBold,
  },
  disabled: {
    opacity: 0.45,
  },
});
