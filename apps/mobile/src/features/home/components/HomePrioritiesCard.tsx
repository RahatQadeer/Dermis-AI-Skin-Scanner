import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { concernLabel } from '../lib/concernLabel';
import type { HomeScanSnapshot } from '../mock/homeMockScenarios';

export type HomePrioritiesCardProps = {
  scan: HomeScanSnapshot;
};

export function HomePrioritiesCard({ scan }: HomePrioritiesCardProps) {
  const h = getCopy().screens.home;
  return (
    <View style={styles.block}>
      <AppText variant="label" color={colors.pinkAccent}>
        {h.prioritiesTitle.toUpperCase()}
      </AppText>
      <Card style={styles.card}>
        {scan.priorities.map((id, index) => (
          <View key={id} style={[styles.row, index > 0 ? styles.rowDivider : null]}>
            <AppText variant="bodyStrong">{concernLabel(id)}</AppText>
            <AppText variant="bodyStrong" color={colors.mute}>
              {String(scan.concernScores[id])}
            </AppText>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.none,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.rowDivider,
  },
});
