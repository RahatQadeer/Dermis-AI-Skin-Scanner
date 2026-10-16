import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { IconButton } from '@/src/components/IconButton';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type HeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  /** Hide back even if onBack is set (e.g. root of stack). */
  showBack?: boolean;
};

export function Header({ title, onBack, right, showBack }: HeaderProps) {
  const nav = getCopy().nav;
  const canBack = Boolean(onBack) && showBack !== false;

  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={styles.side}>
        {canBack ? (
          <IconButton accessibilityLabel={nav.backA11y} onPress={onBack} size={44}>
            <AppText variant="headline" color={colors.ink}>
              {nav.backGlyph}
            </AppText>
          </IconButton>
        ) : null}
      </View>
      <AppText
        variant="headline"
        align="center"
        color={colors.ink}
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </AppText>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  side: {
    minWidth: 48,
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
});
