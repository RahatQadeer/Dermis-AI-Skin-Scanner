import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type EmptyStateProps = {
  title?: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
};

export function EmptyState({ title, body, actionLabel, onAction, illustration }: EmptyStateProps) {
  const c = getCopy().feedback;
  const resolvedTitle = title ?? c.emptyDefaultTitle;
  const resolvedBody = body ?? c.emptyDefaultBody;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {illustration ? <View style={styles.art}>{illustration}</View> : null}
      <AppText variant="headline" align="center">
        {resolvedTitle}
      </AppText>
      <AppText variant="body" color={colors.mute} align="center">
        {resolvedBody}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  art: {
    marginBottom: spacing.sm,
  },
});
