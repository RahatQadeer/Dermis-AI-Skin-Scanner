import { CONCERN_IDS, scoreColor } from '@dermis/domain';
import { Pressable, StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { scoreTokenToColor } from '@/src/lib/scoreTokenToColor';
import { colors, radii, spacing, textStyles } from '@/src/theme';

import { formatLastScanLabel } from '../lib/formatLastScanLabel';
import type { HomeScanSnapshot } from '../mock/homeMockScenarios';

export type HomeHeroCardProps = {
  scan: HomeScanSnapshot;
  onViewReport: () => void;
};

function SegmentBar({ scores }: { scores: HomeScanSnapshot['concernScores'] }) {
  return (
    <View style={styles.segments}>
      {CONCERN_IDS.map((id) => (
        <View
          key={id}
          style={[styles.segment, { backgroundColor: scoreTokenToColor(scoreColor(scores[id])) }]}
        />
      ))}
    </View>
  );
}

export function HomeHeroCard({ scan, onViewReport }: HomeHeroCardProps) {
  const h = getCopy().screens.home;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <AppText variant="label" color={colors.muteSoft}>
            {h.indexTitle.toUpperCase()}
          </AppText>
          <View style={styles.valueRow}>
            <AppText style={styles.value} color={colors.ink}>
              {String(scan.indexScore)}
            </AppText>
            <View style={styles.deltaPill}>
              <AppText variant="caption" color={colors.greenDeep}>
                {h.indexDelta(scan.indexDelta ?? 0)}
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.bubble}>
          <SpeechBubble message={h.heroBubble} tail="right" compact />
        </View>
      </View>
      <SegmentBar scores={scan.concernScores} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={h.viewReport}
        onPress={onViewReport}
        hitSlop={spacing.sm}
      >
        <AppText variant="bodyStrong" color={colors.ink}>
          {h.viewReport}
        </AppText>
      </Pressable>
      <AppText variant="caption" color={colors.muteSoft}>
        {formatLastScanLabel(scan.takenAt, h)}
      </AppText>
      <View style={styles.sheep} pointerEvents="none">
        <Mascot mood="happy" size={SHEEP_SIZE} showBubble={false} />
      </View>
    </View>
  );
}

const SHEEP_SIZE = 92;
/** Keep concern bars clear of the absolute sheep. */
const SHEEP_CLEARANCE = SHEEP_SIZE + spacing.md;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.hero,
    borderRadius: radii.card,
    padding: spacing.lg,
    paddingBottom: spacing.lg + spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: SHEEP_CLEARANCE * 0.35,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    ...textStyles.display,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  bubble: {
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingRight: SHEEP_CLEARANCE,
  },
  segment: {
    flex: 1,
    height: spacing.sm,
    borderRadius: radii.pill,
  },
  sheep: {
    position: 'absolute',
    right: spacing.xs,
    bottom: -spacing.xs,
  },
});
