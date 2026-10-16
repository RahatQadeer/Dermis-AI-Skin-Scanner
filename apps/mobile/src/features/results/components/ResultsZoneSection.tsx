import type { ZoneId } from '@dermis/domain';
import { isElementUnlocked, type Plan } from '@dermis/domain/server';
import { StyleSheet, View } from 'react-native';

import { LockedOverlay } from '@/src/components/LockedOverlay';
import { ZoneMap } from '@/src/components/ZoneMap';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import { ZoneActiveDetail, ZoneActiveSummary } from './ZoneActiveDetail';

export type ResultsZoneSectionProps = {
  plan: Plan;
  zoneScores: Record<ZoneId, number>;
  selectedZoneId: ZoneId | null;
  onSelectZone: (zoneId: ZoneId) => void;
  onUnlock: () => void;
};

export function ResultsZoneSection({
  plan,
  zoneScores,
  selectedZoneId,
  onSelectZone,
  onUnlock,
}: ResultsZoneSectionProps) {
  const r = getCopy().screens.results;
  const unlocked = isElementUnlocked(plan, 'zoneMap');
  const activeId = selectedZoneId;
  const activeScore = activeId ? zoneScores[activeId] : undefined;
  const activeBlurb = activeId ? r.zoneBlurbs[activeId] : undefined;
  const showActive = Boolean(activeId && activeScore !== undefined);

  return (
    <View style={styles.block}>
      <View style={styles.headerRow}>
        <AppText variant="headline" color={colors.ink} style={styles.title}>
          {r.zonesTitle}
        </AppText>
        <AppText variant="caption" color={colors.muteFoot}>
          {r.zonesTapHint}
        </AppText>
      </View>
      <LockedOverlay locked={!unlocked} onUnlock={onUnlock} hint={r.zonesLockedHint}>
        <View style={styles.mapCard}>
          <ZoneMap
            scores={zoneScores}
            selectedZoneId={selectedZoneId}
            onSelectZone={unlocked ? onSelectZone : undefined}
            size={260}
          />
          {showActive && activeId ? (
            <ZoneActiveSummary zoneId={activeId} score={activeScore!} />
          ) : null}
        </View>
        {showActive && activeId && activeBlurb ? (
          <ZoneActiveDetail zoneId={activeId} score={activeScore!} blurb={activeBlurb} />
        ) : null}
      </LockedOverlay>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxs,
  },
  title: {
    fontFamily: fontFamilies.headingBold,
  },
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
});
