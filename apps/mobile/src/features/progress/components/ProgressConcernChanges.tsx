import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { concernCopy } from '@/src/copy/concerns';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { formatIndexDelta } from '../lib/formatIndexDelta';
import type { ConcernChange } from '../lib/buildProgressSummary';

export type ProgressConcernChangesProps = {
  changes: readonly ConcernChange[];
};

export function ProgressConcernChanges({ changes }: ProgressConcernChangesProps) {
  return (
    <Card padded={false}>
      {changes.map((change, index) => (
        <ConcernRow key={change.id} change={change} divider={index > 0} />
      ))}
    </Card>
  );
}

function ConcernRow({ change, divider }: { change: ConcernChange; divider: boolean }) {
  const p = getCopy().screens.progress;
  const deltaLabel = formatIndexDelta(change.delta, p);
  const deltaColor = change.delta > 0 ? colors.green : change.delta < 0 ? colors.red : colors.mute;

  return (
    <View style={[styles.row, divider ? styles.divider : null]}>
      <AppText variant="bodyStrong" color={colors.ink} style={styles.name}>
        {concernCopy[change.id]}
      </AppText>
      <AppText variant="caption" color={colors.muteBody} style={styles.arrow}>
        {`${String(change.before)} → ${String(change.after)}`}
      </AppText>
      <AppText variant="bodyStrong" color={deltaColor} style={styles.delta}>
        {deltaLabel ?? p.deltaFlat}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.rowDivider,
  },
  name: {
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 72,
  },
  arrow: {
    flexShrink: 0,
    textAlign: 'center',
  },
  delta: {
    minWidth: 48,
    flexShrink: 0,
    textAlign: 'right',
  },
});
