import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import { colors, spacing } from '@/src/theme';

import type { HomeScanSnapshot } from '../mock/homeMockScenarios';

export type HomeStatCardsProps = {
  scan: HomeScanSnapshot | null;
};

/** Two focus scores from the latest scan — no placeholder SPF tiles. */
export function HomeStatCards({ scan }: HomeStatCardsProps) {
  const h = getCopy().screens.home;
  if (!scan) {
    return null;
  }
  const hydration = scan.concernScores.hydration;
  const texture = scan.concernScores.texture;
  return (
    <View style={styles.block}>
      <AppText variant="headline" color={colors.ink}>
        {h.metricsTitle}
      </AppText>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Card style={styles.tile}>
            <AppText variant="caption" color={colors.mute}>
              {concernLabel('hydration')}
            </AppText>
            <AppText variant="title">{String(hydration)}</AppText>
            <AppText variant="caption" color={colors.mute}>
              {h.metricsFromScan}
            </AppText>
          </Card>
        </View>
        <View style={styles.cell}>
          <Card style={styles.tile}>
            <AppText variant="caption" color={colors.mute}>
              {concernLabel('texture')}
            </AppText>
            <AppText variant="title">{String(texture)}</AppText>
            <AppText variant="caption" color={colors.mute}>
              {h.metricsFromScan}
            </AppText>
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
  },
  tile: {
    flex: 1,
    gap: spacing.xxs,
  },
});
