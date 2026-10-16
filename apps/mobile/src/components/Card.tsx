import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/src/theme';

export type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ padded = true, elevated = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.base, padded ? styles.padded : null, elevated ? shadows.card : null, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
});
