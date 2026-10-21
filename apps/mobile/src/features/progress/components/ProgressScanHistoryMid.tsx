import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import { SEGMENT_CONCERN_ORDER, segmentColorForScore } from '../lib/concernSegmentColors';
import { formatShortDate } from '../lib/formatShortDate';
import type { ProgressScan } from '../types/progressTypes';

export function ProgressScanHistoryMid({
  scan,
  isLatest,
}: {
  scan: ProgressScan;
  isLatest: boolean;
}) {
  const p = getCopy().screens.progress;
  const dateLabel = formatShortDate(scan.capturedAt);
  const isBaseline = scan.scanNumber === 1;
  const meta = isBaseline
    ? p.scanMetaBaseline(scan.capturedTime, scan.scanNumber)
    : p.scanMeta(scan.capturedTime, scan.scanNumber);

  return (
    <View style={styles.mid}>
      <View style={styles.dateRow}>
        <AppText variant="bodyStrong" color={colors.ink} style={styles.date}>
          {dateLabel}
        </AppText>
        {isLatest ? (
          <View style={styles.latestPill}>
            <AppText variant="caption" color={colors.surface} style={styles.latestText}>
              {p.latestBadge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" color={colors.muteFoot}>
        {meta}
      </AppText>
      <View style={styles.segments}>
        {SEGMENT_CONCERN_ORDER.map((id) => (
          <View
            key={id}
            style={[
              styles.segment,
              { backgroundColor: segmentColorForScore(scan.concernScores[id]) },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mid: {
    flex: 1,
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  date: {
    fontFamily: fontFamilies.headingBold,
  },
  latestPill: {
    backgroundColor: colors.pinkBright,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  latestText: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 11,
  },
  segments: {
    flexDirection: 'row',
    gap: 3,
    marginTop: spacing.xxs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    maxWidth: 22,
  },
});
