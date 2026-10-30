import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@/src/theme';

export type ResultsIndexHeroProps = {
  indexScore: number;
  /** e.g. "+4 vs 21 Sept" — omit when no prior scan. */
  deltaLabel?: string;
  /** Skin age estimate label — omit when unavailable. */
  insight: string;
};

export function ResultsIndexHero({ indexScore, deltaLabel, insight }: ResultsIndexHeroProps) {
  const r = getCopy().screens.results;
  const showPills = Boolean(deltaLabel);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textCol}>
          <AppText variant="caption" color={colors.muteBody} style={styles.eyebrow}>
            {r.indexTitle}
          </AppText>
          <AppText style={styles.score} color={colors.ink}>
            {String(indexScore)}
          </AppText>
          {showPills ? (
            <View style={styles.pills}>
              {deltaLabel ? (
                <View style={[styles.pill, styles.pillDelta]}>
                  <AppText variant="caption" color={colors.greenDeep} style={styles.pillText}>
                    {deltaLabel}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
        <Mascot character="dermis" mood="happy" size={96} showBubble={false} />
      </View>
      <View style={styles.bubbleWrap}>
        <View style={styles.bubbleTail} />
        <View style={styles.bubble}>
          <AppText variant="body" color={colors.ink}>
            {insight}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" color={colors.muteBody}>
        {r.indexCaption}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.hero,
    borderRadius: radii.xxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    overflow: 'visible',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  eyebrow: {
    fontFamily: fontFamilies.bodyBold,
    letterSpacing: 0.6,
  },
  score: {
    fontFamily: fontFamilies.headingBold,
    fontSize: fontSizes.display + 8,
    lineHeight: fontSizes.display + 12,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pillDelta: {
    backgroundColor: colors.greenSoft,
  },
  pillText: {
    fontFamily: fontFamilies.bodySemiBold,
  },
  bubbleWrap: {
    marginTop: spacing.xs,
    alignSelf: 'stretch',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    marginLeft: spacing.xxl,
    marginBottom: -1,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surface,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
