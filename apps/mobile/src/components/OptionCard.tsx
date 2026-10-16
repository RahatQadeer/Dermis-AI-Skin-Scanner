import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, radii, spacing } from '@/src/theme';

export type OptionCardProps = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Optional leading swatch/content (children-style slot, no icon lib). */
  leading?: ReactNode;
  accessibilityLabel?: string;
};

export function OptionCard({
  title,
  subtitle,
  selected = false,
  disabled = false,
  onPress,
  leading,
  accessibilityLabel,
}: OptionCardProps) {
  const label = accessibilityLabel ?? buildLabel(title, subtitle);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={[styles.card, cardChrome(selected, disabled)]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.mute}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <SelectionMark selected={selected} />
    </Pressable>
  );
}

function buildLabel(title: string, subtitle?: string): string {
  return subtitle ? `${title}. ${subtitle}` : title;
}

function cardChrome(selected: boolean, disabled: boolean) {
  return {
    borderColor: selected ? colors.green : colors.border,
    backgroundColor: selected ? colors.background : colors.surface,
    opacity: disabled ? 0.45 : 1,
  };
}

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.check, selected ? styles.checkOn : null]}>
      {selected ? (
        <AppText variant="caption" color={colors.surface}>
          {CHECK_MARK}
        </AppText>
      ) : null}
    </View>
  );
}

const CHECK_MARK = '✓';

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  leading: {
    marginRight: spacing.xs,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
});
