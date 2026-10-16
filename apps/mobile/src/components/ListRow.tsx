import type { ReactNode } from 'react';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, spacing } from '@/src/theme';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export const ListRow = memo(function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  disabled = false,
  accessibilityLabel,
}: ListRowProps) {
  const interactive = Boolean(onPress) && !disabled;
  const label = accessibilityLabel ?? (subtitle ? `${title}. ${subtitle}` : title);

  const body = (
    <View style={[styles.row, disabled ? styles.disabled : null]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textBlock}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.mute}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  if (!interactive) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      {body}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  leading: {
    marginRight: spacing.xs,
  },
  trailing: {
    marginLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
});
