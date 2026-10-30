import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

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
  const p = getCopy().screens.progress;

  if (!summary || scans.length === 0) {
    return <ProgressEmptyStates loadError={loadError} onRetry={onRetry} />;
  }

  const vsPrevious = summary.previousVsLatest;

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
      {vsPrevious ? (
        <ProgressBeforeAfter
          baselineDate={formatShortDate(vsPrevious.previousDate)}
          baselineScore={vsPrevious.previousScore}
          latestDate={formatShortDate(vsPrevious.latestDate)}
          latestScore={vsPrevious.latestScore}
          baselineLabel={p.previousLabel}
          title={p.vsPreviousTitle}
          hint={p.vsPreviousHint}
        />
      ) : (
        <AppText variant="caption" color={colors.muteFoot} align="center">
          {p.singleScanHint}
        </AppText>
      )}
      {scans.length >= 2 ? (
        <ProgressBeforeAfter
          baselineDate={formatShortDate(summary.startDate)}
          baselineScore={summary.baseline}
          latestDate={formatShortDate(scans[0]!.capturedAt)}
          latestScore={summary.current}
        />
      ) : null}
      <ProgressConcernChanges
        changes={vsPrevious ? vsPrevious.concernChanges : summary.concernChanges}
      />
      <ProgressHistoryList scans={scans} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
});
