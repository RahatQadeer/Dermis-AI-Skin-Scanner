import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { LockedOverlay } from '@/src/components/LockedOverlay';
import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useHomeSnapshot } from '@/src/features/home/hooks/useHomeSnapshot';
import { colors, spacing } from '@/src/theme';
import { isElementUnlocked } from '@dermis/domain/server';

import { ProgressBody } from '../components/ProgressBody';
import { ProgressWindowToggle } from '../components/ProgressWindowToggle';
import { useProgressScans } from '../hooks/useProgressScans';
import { filterScansByWindow } from '../lib/filterScansByWindow';
import type { ProgressWindow } from '../types/progressTypes';

export function ProgressScreen() {
  const router = useRouter();
  const snapshot = useHomeSnapshot();
  const unlocked = isElementUnlocked(snapshot.quota.plan, 'progressAnalytics');
  const p = getCopy().screens.progress;
  const [window, setWindow] = useState<ProgressWindow>('90');
  const { scans: allScans, loading, error } = useProgressScans();
  const scans = useMemo(
    () => filterScansByWindow(allScans, window, new Date()),
    [allScans, window],
  );

  return (
    <Screen scroll padded edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <View style={styles.titleRow}>
        <AppText variant="title" color={colors.ink}>
          {getCopy().nav.progress}
        </AppText>
        <ProgressWindowToggle value={window} onChange={setWindow} disabled={!unlocked} />
      </View>
      <LockedOverlay
        locked={!unlocked}
        onUnlock={() => router.push('/paywall')}
        hint={p.lockedHint}
      >
        {loading ? (
          <ActivityIndicator color={colors.ink} style={styles.loader} />
        ) : (
          <ProgressBody window={window} scans={scans} loadError={error} />
        )}
      </LockedOverlay>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
