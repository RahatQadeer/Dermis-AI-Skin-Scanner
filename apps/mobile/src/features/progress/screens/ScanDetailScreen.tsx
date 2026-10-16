import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { ScanDetailContent } from '../components/ScanDetailContent';
import { useProgressScans } from '../hooks/useProgressScans';
import { adjacentScanIds } from '../lib/scanNavigation';
import { ScanDetailLoading, ScanDetailMissing } from './ScanDetailScreenStates';

export function ScanDetailScreen() {
  const router = useRouter();
  const { scanId: raw } = useLocalSearchParams<{ scanId: string }>();
  const scanId = typeof raw === 'string' ? raw : '';
  const p = getCopy().screens.progress;
  const { scans: ordered, loading } = useProgressScans();
  const scan = useMemo(() => ordered.find((item) => item.id === scanId), [ordered, scanId]);
  const navIds = adjacentScanIds(ordered, scanId);
  const previous = ordered.find((item) => item.id === navIds.previousId);

  if (loading) {
    return <ScanDetailLoading router={router} />;
  }

  if (!scan) {
    return <ScanDetailMissing router={router} />;
  }

  return (
    <Screen
      scroll
      padded
      edges={['top', 'left', 'right']}
      style={styles.screen}
      contentStyle={styles.content}
    >
      <StatusBar style="dark" />
      <Header title={p.detailTitle} onBack={() => router.back()} />
      <ScanDetailContent
        scan={scan}
        previous={previous}
        previousId={navIds.previousId}
        nextId={navIds.nextId}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
});
