import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import { formatIndexDelta } from '../lib/formatIndexDelta';
import { formatShortDate } from '../lib/formatShortDate';
import type { ProgressScan } from '../types/progressTypes';
import { ProgressScanHistoryMid } from './ProgressScanHistoryMid';

export type ProgressScanHistoryCardProps = {
  scan: ProgressScan;
  isLatest: boolean;
  delta: number | null;
  onPress: () => void;
};

export function ProgressScanHistoryCard({
  scan,
  isLatest,
  delta,
  onPress,
}: ProgressScanHistoryCardProps) {
  const p = getCopy().screens.progress;
  const dateLabel = formatShortDate(scan.capturedAt);
  const deltaLabel =
    delta === null ? p.baseDelta : (formatIndexDelta(delta, p) ?? p.deltaFlat);
  const deltaColor =
    delta === null ? colors.muteFoot : delta > 0 ? colors.green : delta < 0 ? colors.red : colors.mute;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.openScanA11y(dateLabel)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ScanThumb />
      <ProgressScanHistoryMid scan={scan} isLatest={isLatest} />
      <View style={styles.right}>
        <View style={styles.scoreRow}>
          <AppText variant="title" color={colors.ink} style={styles.score}>
            {String(scan.indexScore)}
          </AppText>
          <AppText variant="body" color={colors.muteFoot}>
            ›
          </AppText>
        </View>
        <AppText variant="caption" color={deltaColor} style={styles.delta}>
          {deltaLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

function ScanThumb() {
  return (
    <View style={styles.thumb} accessibilityElementsHidden>
      <View style={[styles.stripe, styles.stripeA]} />
      <View style={[styles.stripe, styles.stripeB]} />
      <View style={[styles.stripe, styles.stripeC]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  pressed: {
    opacity: 0.92,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.cream,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    width: 14,
    height: 80,
    backgroundColor: colors.borderMuted,
    opacity: 0.7,
  },
  stripeA: {
    left: 4,
    transform: [{ rotate: '28deg' }],
  },
  stripeB: {
    left: 22,
    transform: [{ rotate: '28deg' }],
  },
  stripeC: {
    left: 40,
    transform: [{ rotate: '28deg' }],
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
    minWidth: 44,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  score: {
    fontFamily: fontFamilies.headingBold,
  },
  delta: {
    fontFamily: fontFamilies.bodySemiBold,
  },
});
