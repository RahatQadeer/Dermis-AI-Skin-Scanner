/**
 * Icon-free primitive: pass glyph/content as `children` (text, SVG, emoji placeholder).
 * Do not add an icon library here — dependency-free by design (DERM-010).
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, radii, spacing, touchTargets } from '@/src/theme';

export type IconButtonProps = Omit<PressableProps, 'children'> & {
  accessibilityLabel: string;
  children: ReactNode;
  size?: number;
  tone?: 'default' | 'pink' | 'danger';
};

export function IconButton({
  accessibilityLabel,
  children,
  size = touchTargets.min,
  tone = 'default',
  disabled = false,
  style,
  ...rest
}: IconButtonProps) {
  const borderTint = tone === 'pink' ? colors.pink : tone === 'danger' ? colors.red : colors.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={spacing.sm}
      style={(state) => [
        styles.base,
        {
          width: Math.max(size, touchTargets.min),
          height: Math.max(size, touchTargets.min),
          opacity: disabled ? 0.4 : state.pressed ? 0.7 : 1,
          borderColor: borderTint,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: touchTargets.min,
    minHeight: touchTargets.min,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
  },
});
