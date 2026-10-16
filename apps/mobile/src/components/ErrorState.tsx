import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type ErrorStateProps = {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({ title, body, onRetry, retryLabel }: ErrorStateProps) {
  const c = getCopy().feedback;
  const common = getCopy().common;
  const resolvedTitle = title ?? c.errorDefaultTitle;
  const resolvedBody = body ?? c.errorDefaultBody;

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <AppText variant="headline" align="center" color={colors.red}>
        {resolvedTitle}
      </AppText>
      <AppText variant="body" color={colors.mute} align="center">
        {resolvedBody}
      </AppText>
      {onRetry ? (
        <Button label={retryLabel ?? common.retry} onPress={onRetry} variant="primary" />
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
});
