import { Fragment } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, spacing } from '@/src/theme';

import { indexDelta } from '../lib/scanNavigation';
import type { ProgressScan } from '../types/progressTypes';
import { ProgressNewFaceDivider } from './ProgressNewFaceDivider';
import { ProgressScanHistoryCard } from './ProgressScanHistoryCard';

export type ProgressHistoryListProps = {
  scans: readonly ProgressScan[];
};

export function ProgressHistoryList({ scans }: ProgressHistoryListProps) {
  const router = useRouter();
  const p = getCopy().screens.progress;

  if (scans.length === 0) {
    return null;
  }

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <AppText variant="headline" color={colors.ink} style={styles.title}>
          {p.historyTitle}
        </AppText>
        <AppText variant="caption" color={colors.muteFoot}>
          {p.historyCount(scans.length)}
        </AppText>
      </View>
      <View style={styles.list}>
        {scans.map((scan, index) => {
          const older = scans[index + 1];
          const sameSeries =
            older != null && (scan.faceEnrollmentId ?? null) === (older.faceEnrollmentId ?? null);
          const delta = sameSeries
            ? indexDelta(scan.indexScore, older?.indexScore)
            : indexDelta(scan.indexScore, undefined);
          const showNewFaceDivider =
            older != null && (scan.faceEnrollmentId ?? '') !== (older.faceEnrollmentId ?? '');
          return (
            <Fragment key={scan.id}>
              <ProgressScanHistoryCard
                scan={scan}
                isLatest={index === 0}
                delta={delta}
                onPress={() => router.push(`/(tabs)/progress/${scan.id}`)}
              />
              {showNewFaceDivider ? <ProgressNewFaceDivider /> : null}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    fontFamily: fontFamilies.headingBold,
  },
  list: {
    gap: spacing.sm,
  },
});
