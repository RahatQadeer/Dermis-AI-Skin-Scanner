import { StyleSheet, View } from 'react-native';

import { spacing } from '@/src/theme';

import { buildProgressSummary } from '../lib/buildProgressSummary';
import { formatShortDate } from '../lib/formatShortDate';
import { windowDayCount } from '../lib/filterScansByWindow';
import type { ProgressLoadError } from '../hooks/useProgressScans';
import type { ProgressScan, ProgressWindow } from '../types/progressTypes';
import { ProgressBeforeAfter } from './ProgressBeforeAfter';
import { ProgressConcernChanges } from './ProgressConcernChanges';
import { ProgressEmptyStates } from './ProgressEmptyStates';
import { ProgressHistoryList } from './ProgressHistoryList';
import { ProgressIndexCard } from './ProgressIndexCard';

export type ProgressBodyProps = {
  window: ProgressWindow;
  scans: readonly ProgressScan[];
  loadError?: ProgressLoadError | null;
  onRetry?: () => void;
};

export function ProgressBody({ window, scans, loadError = null, onRetry }: ProgressBodyProps) {
  const summary = buildProgressSummary(scans);

  if (!summary || scans.length === 0) {
    return <ProgressEmptyStates loadError={loadError} onRetry={onRetry} />;
  }

  return (
    <View style={styles.stack}>
      <ProgressIndexCard
        current={summary.current}
        baseline={summary.baseline}
        delta={summary.delta}
        days={windowDayCount(window)}
        values={summary.values}
        startLabel={formatShortDate(summary.startDate)}
      />
      <ProgressBeforeAfter
        baselineDate={formatShortDate(summary.startDate)}
        baselineScore={summary.baseline}
        latestDate={formatShortDate(scans[0]!.capturedAt)}
        latestScore={summary.current}
      />
      <ProgressConcernChanges changes={summary.concernChanges} />
      <ProgressHistoryList scans={scans} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
});
