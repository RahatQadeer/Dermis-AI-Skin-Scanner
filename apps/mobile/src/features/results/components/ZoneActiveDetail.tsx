import type { ZoneId } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

export function ZoneActiveSummary({ zoneId, score }: { zoneId: ZoneId; score: number }) {
  const zones = getCopy().zones;
  return (
    <View style={styles.summaryBar}>
      <AppText variant="bodyStrong" color={colors.ink} style={styles.summaryTitle}>
        {zones[zoneId]}
      </AppText>
      <AppText style={styles.summaryScore} color={colors.ink}>
        {String(score)}
      </AppText>
    </View>
  );
}

export function ZoneActiveDetail({
  zoneId,
  score,
  blurb,
}: {
  zoneId: ZoneId;
  score: number;
  blurb: string;
}) {
  const zones = getCopy().zones;
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <AppText variant="bodyStrong" color={colors.ink} style={styles.detailTitle}>
          {zones[zoneId]}
        </AppText>
        <AppText style={styles.detailScore} color={colors.ink}>
          {String(score)}
        </AppText>
      </View>
      <AppText variant="body" color={colors.muteBody}>
        {blurb}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBar: {
    alignSelf: 'stretch',
    backgroundColor: colors.zoneDetailBg,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryTitle: {
    fontFamily: fontFamilies.bodyBold,
    flex: 1,
  },
  summaryScore: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 22,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  detailCard: {
    marginTop: spacing.md,
    backgroundColor: colors.zoneDetailBg,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailTitle: {
    fontFamily: fontFamilies.bodyBold,
    flex: 1,
  },
  detailScore: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 28,
    lineHeight: 32,
    fontVariant: ['tabular-nums'],
  },
});
