import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { ProgressRing } from '@/src/components/ProgressRing';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, shadows, spacing } from '@/src/theme';

import { formatShortDate } from '../lib/formatShortDate';
import type { ProgressScan } from '../types/progressTypes';

export function ScanDetailHero({
  scan,
  previous,
}: {
  scan: ProgressScan;
  previous: ProgressScan | undefined;
}) {
  const p = getCopy().screens.progress;
  const isBaseline = scan.scanNumber === 1;
  const delta = previous ? scan.indexScore - previous.indexScore : null;
  const meta = isBaseline
    ? p.scanMetaBaseline(scan.capturedTime, scan.scanNumber)
    : p.scanMeta(scan.capturedTime, scan.scanNumber);

  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.heroText}>
          <AppText variant="label" color={colors.muteSoft}>
            {p.shiLabel}
          </AppText>
          <AppText style={styles.heroScore} color={colors.ink}>
            {String(scan.indexScore)}
          </AppText>
          <ScanDetailDeltaChips delta={delta} capturedAt={scan.capturedAt} />
          <AppText variant="caption" color={colors.muteFoot}>
            {meta}
          </AppText>
        </View>
        <View style={styles.heroRight}>
          <ProgressRing progress={scan.indexScore} size={96} label={String(scan.indexScore)} />
          <View style={styles.sheep}>
            <Mascot mood="happy" size={56} showBubble={false} />
          </View>
        </View>
      </View>
    </View>
  );
}

function ScanDetailDeltaChips({
  delta,
  capturedAt,
}: {
  delta: number | null;
  capturedAt: string;
}) {
  const p = getCopy().screens.progress;
  return (
    <View style={styles.chipRow}>
      <View style={styles.chip}>
        <AppText variant="caption" color={colors.ink}>
          {formatShortDate(capturedAt)}
        </AppText>
      </View>
      {delta != null ? (
        <View style={[styles.chip, delta >= 0 ? styles.chipUp : styles.chipDown]}>
          <AppText
            variant="caption"
            color={delta >= 0 ? colors.greenDeep : colors.red}
            style={styles.chipStrong}
          >
            {delta === 0 ? p.deltaFlat : delta > 0 ? p.deltaUp(delta) : p.deltaDown(delta)}
          </AppText>
        </View>
      ) : (
        <View style={[styles.chip, styles.chipBaseline]}>
          <AppText variant="caption" color={colors.pink} style={styles.chipStrong}>
            {p.baselineTag}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.hero,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    ...shadows.soft,
  },
  heroTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  heroScore: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 56,
    lineHeight: 60,
    fontVariant: ['tabular-nums'],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipUp: {
    backgroundColor: colors.greenSoft,
  },
  chipDown: {
    backgroundColor: colors.noteSoft,
  },
  chipBaseline: {
    backgroundColor: colors.noteSoft,
  },
  chipStrong: {
    fontFamily: fontFamilies.bodySemiBold,
  },
  heroRight: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  sheep: {
    marginTop: -spacing.sm,
  },
});
