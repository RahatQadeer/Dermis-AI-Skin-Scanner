import { CONCERN_IDS } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';

import { ScoreBar } from '@/src/components/ScoreBar';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import type { ProgressScan } from '../types/progressTypes';

export type ScanDetailConcernsProps = {
  scan: ProgressScan;
};

export function ScanDetailConcerns({ scan }: ScanDetailConcernsProps) {
  const p = getCopy().screens.progress;

  return (
    <View style={styles.block}>
      <AppText variant="headline" color={colors.ink} style={styles.title}>
        {p.detailConcernsTitle}
      </AppText>
      <View style={styles.card}>
        {CONCERN_IDS.map((id, index) => (
          <View
            key={id}
            style={[styles.row, index < CONCERN_IDS.length - 1 ? styles.rowDivider : null]}
          >
            <ScoreBar label={concernLabel(id)} score={scan.concernScores[id]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  title: {
    fontFamily: fontFamilies.headingBold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  row: {
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rowDivider,
  },
});
