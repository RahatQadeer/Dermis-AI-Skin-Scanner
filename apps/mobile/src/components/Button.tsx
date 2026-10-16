import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { spacing } from '@/src/theme';

import {
  buttonRadii,
  resolveButtonVisual,
  type ButtonSize,
  type ButtonVariant,
} from './Button.styles';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const visual = resolveButtonVisual({ variant, size, disabled: isDisabled });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        {
          backgroundColor: visual.backgroundColor,
          borderColor: visual.borderColor,
          borderWidth: visual.borderWidth,
          minHeight: visual.minHeight,
          paddingHorizontal: visual.paddingHorizontal,
          opacity: state.pressed && !isDisabled ? 0.85 : visual.opacity,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={visual.textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <AppText variant="bodyStrong" color={visual.textColor}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: buttonRadii,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
