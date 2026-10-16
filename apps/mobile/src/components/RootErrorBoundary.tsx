import type { ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

/**
 * Root route ErrorBoundary (DERM-070).
 * TODO(spec): wire Sentry.captureException after crash SDK + data-safety update.
 */
export function RootErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const f = getCopy().feedback;

  if (__DEV__) {
    console.error('[RootErrorBoundary]', error);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content} accessibilityRole="alert">
        <AppText variant="headline" align="center">
          {f.crashTitle}
        </AppText>
        <AppText variant="body" color={colors.mute} align="center">
          {f.crashBody}
        </AppText>
        {__DEV__ ? (
          <AppText variant="caption" color={colors.inkMuted} align="center" selectable>
            {error.message}
          </AppText>
        ) : null}
        <Button label={f.crashRetry} size="lg" onPress={() => void retry()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
});
