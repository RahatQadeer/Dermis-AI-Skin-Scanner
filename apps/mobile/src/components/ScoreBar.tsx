import { scoreColor } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { clampScore } from '@/src/lib/clampScore';
import { scoreTokenToColor } from '@/src/lib/scoreTokenToColor';
import { colors, radii, spacing } from '@/src/theme';

export type ScoreBarProps = {
  label: string;
  score: number;
  /** Optional delta text e.g. "+4" */
  deltaLabel?: string;
  accessibilityLabel?: string;
};

export function ScoreBar({ label, score, deltaLabel, accessibilityLabel }: ScoreBarProps) {
  const clamped = clampScore(score);
  const fill = scoreTokenToColor(scoreColor(clamped));
  const a11y =
    accessibilityLabel ??
    (deltaLabel
      ? `${label}, ${String(clamped)} of 100, ${deltaLabel}`
      : `${label}, ${String(clamped)} of 100`);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={a11y}
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
    >
      <View style={styles.header} accessible={false}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText variant="bodyStrong" color={fill}>
          {String(clamped)}
        </AppText>
      </View>
      <View style={styles.track} accessible={false}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fill }]} />
      </View>
      {deltaLabel ? (
        <AppText variant="caption" color={colors.mute} accessible={false}>
          {deltaLabel}
        </AppText>
      ) : null}
    </View>
  );
}

export { clampScore } from '@/src/lib/clampScore';

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});
