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
  /** Tighter vertical size for screens that need more content near the top. */
  compact?: boolean;
};

export function Header({ title, onBack, right, showBack, compact = false }: HeaderProps) {
  const nav = getCopy().nav;
  const canBack = Boolean(onBack) && showBack !== false;

  return (
    <View style={[styles.row, compact ? styles.rowCompact : null]} accessibilityRole="header">
      <View style={styles.side}>
        {canBack ? (
          <IconButton accessibilityLabel={nav.backA11y} onPress={onBack} size={compact ? 40 : 44}>
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
  rowCompact: {
    minHeight: 44,
    paddingVertical: 0,
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
