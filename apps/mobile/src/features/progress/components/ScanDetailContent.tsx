import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import type { ProgressScan } from '../types/progressTypes';
import { ScanDetailConcerns } from './ScanDetailConcerns';
import { ScanDetailHero } from './ScanDetailHero';
import { ScanDetailNav } from './ScanDetailNav';

export type ScanDetailContentProps = {
  scan: ProgressScan;
  previous: ProgressScan | undefined;
  previousId: string | null;
  nextId: string | null;
};

export function ScanDetailContent({ scan, previous, previousId, nextId }: ScanDetailContentProps) {
  const p = getCopy().screens.progress;

  return (
    <View style={styles.stack}>
      <ScanDetailHero scan={scan} previous={previous} />
      {previous ? (
        <View style={styles.compareCard}>
          <AppText variant="bodyStrong" color={colors.ink}>
            {p.compareTitle}
          </AppText>
          <View style={styles.compareRow}>
            <CompareCol label={p.beforeLabel} score={previous.indexScore} muted />
            <AppText variant="headline" color={colors.pinkAccent}>
              →
            </AppText>
            <CompareCol label={p.afterLabel} score={scan.indexScore} />
          </View>
        </View>
      ) : null}
      <ScanDetailConcerns scan={scan} />
      <ScanDetailNav previousId={previousId} nextId={nextId} />
    </View>
  );
}

function CompareCol({
  label,
  score,
  muted = false,
}: {
  label: string;
  score: number;
  muted?: boolean;
}) {
  return (
    <View style={styles.compareCol}>
      <AppText variant="caption" color={colors.mute} align="center">
        {label}
      </AppText>
      <AppText
        style={styles.compareScore}
        color={muted ? colors.muteSoft : colors.ink}
        align="center"
      >
        {String(score)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  compareCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  compareCol: {
    flex: 1,
    gap: spacing.xs,
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  compareScore: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 28,
    lineHeight: 32,
    fontVariant: ['tabular-nums'],
  },
});
