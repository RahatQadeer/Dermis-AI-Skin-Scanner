import { scoreColor, type ConcernId } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';

import { LockedOverlay } from '@/src/components/LockedOverlay';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import { clampScore } from '@/src/lib/clampScore';
import { scoreTokenToColor } from '@/src/lib/scoreTokenToColor';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

export function ConcernResultCard(props: {
  id: ConcernId;
  locked: boolean;
  score: number;
  delta?: string;
  onUnlock: () => void;
}) {
  const r = getCopy().screens.results;
  const fill = scoreTokenToColor(scoreColor(clampScore(props.score)));

  return (
    <LockedOverlay locked={props.locked} onUnlock={props.onUnlock}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AppText variant="bodyStrong" color={colors.ink} style={styles.label}>
            {concernLabel(props.id)}
          </AppText>
          <View style={styles.scoreRow}>
            {props.delta ? (
              <AppText variant="caption" color={colors.greenDeep} style={styles.delta}>
                {props.delta}
              </AppText>
            ) : null}
            <AppText style={styles.score} color={colors.ink}>
              {String(props.score)}
            </AppText>
          </View>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${props.score}%`, backgroundColor: fill }]} />
        </View>
        <AppText variant="caption" color={colors.muteBody}>
          {r.concernBlurbs[props.id]}
        </AppText>
      </View>
    </LockedOverlay>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm + 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    fontFamily: fontFamilies.bodyBold,
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  delta: {
    fontFamily: fontFamilies.bodySemiBold,
  },
  score: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 22,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.quizTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});
