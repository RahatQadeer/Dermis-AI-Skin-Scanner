import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import type { HomeScanSnapshot } from '../mock/homeMockScenarios';

export type HomeStatCardsProps = {
  scan: HomeScanSnapshot | null;
};

function StatTile({
  title,
  value,
  caption,
  captionColor,
}: {
  title: string;
  value: string;
  caption: string;
  captionColor: string;
}) {
  return (
    <Card style={styles.tile}>
      <AppText variant="caption" color={colors.mute}>
        {title}
      </AppText>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" color={captionColor}>
        {caption}
      </AppText>
    </Card>
  );
}

export function HomeStatCards({ scan }: HomeStatCardsProps) {
  const h = getCopy().screens.home;
  if (!scan) {
    return null;
  }
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <StatTile
          title={h.hydrationTitle}
          value={String(scan.concernScores.hydration)}
          caption={h.hydrationCaption}
          captionColor={colors.greenDeep}
        />
      </View>
      <View style={styles.cell}>
        <StatTile
          title={h.spfTitle}
          value={h.spfValue}
          caption={h.spfCaption}
          captionColor={colors.amberDeep}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
