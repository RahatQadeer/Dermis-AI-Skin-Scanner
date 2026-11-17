import { CONCERN_IDS, scoreColor } from '@dermis/domain';
import { Pressable, StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import { scoreTokenToColor } from '@/src/lib/scoreTokenToColor';
import { colors, radii, spacing, textStyles, touchTargets } from '@/src/theme';

import { formatLastScanLabel } from '../lib/formatLastScanLabel';
import type { HomeScanSnapshot } from '../mock/homeMockScenarios';

export type HomeHeroCardProps = {
  scan: HomeScanSnapshot;
  onViewReport: () => void;
  onViewRecommendations?: () => void;
};

/** One labeled score per concern — readable, not a cramped strip of text over the sheep. */
function ConcernScoreGrid({ scores }: { scores: HomeScanSnapshot['concernScores'] }) {
  return (
    <View style={styles.grid}>
      {CONCERN_IDS.map((id) => (
        <View key={id} style={styles.gridCell}>
          <View
            style={[styles.bar, { backgroundColor: scoreTokenToColor(scoreColor(scores[id])) }]}
          />
          <AppText variant="caption" color={colors.muteSoft} numberOfLines={1}>
            {concernLabel(id)}
          </AppText>
          <AppText variant="bodyStrong" color={colors.ink}>
            {String(scores[id])}
          </AppText>
        </View>
      ))}
    </View>
  );
}

type HomeCopy = ReturnType<typeof getCopy>['screens']['home'];

function heroBubbleMessage(h: HomeCopy, delta: number): string {
  if (delta === 0) return h.heroBubbleFlat;
  return delta > 0 ? h.heroBubbleUp(delta) : h.heroBubbleDown(delta);
}

function HeroIndexColumn({ h, score, delta }: { h: HomeCopy; score: number; delta: number }) {
  return (
    <View style={styles.left}>
      <AppText variant="label" color={colors.muteSoft}>
        {h.indexTitle.toUpperCase()}
      </AppText>
      <AppText variant="caption" color={colors.mute}>
        {h.indexCaption}
      </AppText>
      <View style={styles.valueRow}>
        <AppText style={styles.value} color={colors.ink}>
          {String(score)}
        </AppText>
        {delta !== 0 ? (
          <View style={styles.deltaPill}>
            <AppText variant="caption" color={delta > 0 ? colors.greenDeep : colors.red}>
              {h.indexDelta(delta)}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function HeroActions({
  h,
  onViewReport,
  onViewRecommendations,
}: {
  h: HomeCopy;
  onViewReport: () => void;
  onViewRecommendations?: () => void;
}) {
  return (
    <View style={styles.actions}>
      <HeroPillButton label={h.viewReport} tone="primary" onPress={onViewReport} />
      {onViewRecommendations ? (
        <HeroPillButton label={h.viewRecommendations} tone="soft" onPress={onViewRecommendations} />
      ) : null}
    </View>
  );
}

export function HomeHeroCard({ scan, onViewReport, onViewRecommendations }: HomeHeroCardProps) {
  const h = getCopy().screens.home;
  const delta = scan.indexDelta ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <HeroIndexColumn h={h} score={scan.indexScore} delta={delta} />
        <View style={styles.sheep}>
          <Mascot
            mood="happy"
            size={SHEEP_SIZE}
            lines={h.mascotLines}
            revealOnTap
            bubbleOverlay
            compactBubble
          />
        </View>
      </View>

      <View style={styles.bubbleWrap}>
        <SpeechBubble message={heroBubbleMessage(h, delta)} tail="left" compact />
      </View>

      <ConcernScoreGrid scores={scan.concernScores} />
      <AppText variant="caption" color={colors.mute}>
        {h.concernBarsHint}
      </AppText>

      <HeroActions
        h={h}
        onViewReport={onViewReport}
        onViewRecommendations={onViewRecommendations}
      />

      <AppText variant="caption" color={colors.muteSoft}>
        {formatLastScanLabel(scan.takenAt, h)}
      </AppText>
    </View>
  );
}

function HeroPillButton({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'soft';
  onPress: () => void;
}) {
  const primary = tone === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        primary ? styles.pillPrimary : styles.pillSoft,
        pressed && styles.pillPressed,
      ]}
    >
      <AppText variant="bodyStrong" color={primary ? colors.surface : colors.ink} align="center">
        {label}
      </AppText>
    </Pressable>
  );
}

const SHEEP_SIZE = 88;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.hero,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'visible',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    overflow: 'visible',
    zIndex: 3,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
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
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  sheep: {
    width: SHEEP_SIZE,
    height: SHEEP_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
    zIndex: 4,
  },
  bubbleWrap: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCell: {
    width: '30%',
    flexGrow: 1,
    gap: spacing.xxs,
    minWidth: 96,
  },
  bar: {
    height: spacing.sm,
    borderRadius: radii.pill,
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    flexGrow: 1,
    flexBasis: '40%',
    minHeight: touchTargets.min,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pillPrimary: {
    backgroundColor: colors.ink,
  },
  pillSoft: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.pinkBright,
  },
  pillPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
