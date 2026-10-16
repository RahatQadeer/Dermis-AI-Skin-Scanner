import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

export type ProgressBeforeAfterProps = {
  baselineDate: string;
  baselineScore: number;
  latestDate: string;
  latestScore: number;
  /** When false, hide the block (need at least one real scan). */
  visible?: boolean;
};

/**
 * Baseline vs latest Skin Health Index from real scans.
 * Photos are not retained after analysis (PRODUCT retention) — scores only.
 */
export function ProgressBeforeAfter({
  baselineDate,
  baselineScore,
  latestDate,
  latestScore,
  visible = true,
}: ProgressBeforeAfterProps) {
  const p = getCopy().screens.progress;
  if (!visible) {
    return null;
  }

  const delta = latestScore - baselineScore;

  return (
    <View style={styles.block}>
      <AppText variant="headline" color={colors.ink}>
        {p.beforeAfterTitle}
      </AppText>
      <AppText variant="caption" color={colors.muteFoot}>
        {p.beforeAfterHint}
      </AppText>
      <View style={styles.row}>
        <ScoreCard label={p.baselineLabel} date={baselineDate} score={baselineScore} />
        <View style={styles.arrowWrap}>
          <AppText variant="headline" color={colors.pinkAccent}>
            →
          </AppText>
          <AppText
            variant="caption"
            color={delta >= 0 ? colors.greenDeep : colors.red}
            style={styles.delta}
          >
            {delta === 0 ? p.deltaFlat : delta > 0 ? p.deltaUp(delta) : p.deltaDown(delta)}
          </AppText>
        </View>
        <ScoreCard label={p.latestLabel} date={latestDate} score={latestScore} highlight />
      </View>
    </View>
  );
}

function ScoreCard({
  label,
  date,
  score,
  highlight = false,
}: {
  label: string;
  date: string;
  score: number;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.card, highlight ? styles.cardHighlight : null]}>
      <AppText variant="caption" color={colors.mute} align="center">
        {label}
      </AppText>
      <AppText style={styles.score} color={colors.ink} align="center">
        {String(score)}
      </AppText>
      <AppText variant="caption" color={colors.muteFoot} align="center">
        {date}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
  },
  cardHighlight: {
    borderColor: colors.pinkBright,
    borderWidth: 1.5,
  },
  score: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 36,
    lineHeight: 40,
    fontVariant: ['tabular-nums'],
  },
  arrowWrap: {
    alignItems: 'center',
    gap: spacing.xxs,
    minWidth: 44,
  },
  delta: {
    fontFamily: fontFamilies.bodySemiBold,
  },
});
