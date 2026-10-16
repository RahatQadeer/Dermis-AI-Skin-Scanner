import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/src/components/EmptyState';
import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export function ScanDetailLoading({ router }: { router: ReturnType<typeof useRouter> }) {
  const p = getCopy().screens.progress;
  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <Header title={p.detailTitle} onBack={() => router.back()} />
      <ActivityIndicator color={colors.ink} style={styles.loader} />
    </Screen>
  );
}

export function ScanDetailMissing({ router }: { router: ReturnType<typeof useRouter> }) {
  const p = getCopy().screens.progress;
  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <Header title={p.detailTitle} onBack={() => router.back()} />
      <EmptyState
        title={p.missingScanTitle}
        body={p.missingScanBody}
        actionLabel={p.backToProgress}
        onAction={() => router.replace('/(tabs)/progress')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xxl,
  },
});
