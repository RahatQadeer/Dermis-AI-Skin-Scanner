import { StyleSheet, View } from 'react-native';

import { MascotFigure } from '@/src/components/mascot/MascotFigure';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, shadows, spacing } from '@/src/theme';

/** Professor Puff on the left with a "picks" speech bubble beside it. */
export function RecommendationsIntro() {
  const r = getCopy().screens.recommendations;

  return (
    <View style={styles.row}>
      <MascotFigure character="professorPuff" mood="happy" size={72} />
      <View style={styles.bubbleWrap}>
        <View style={styles.tail} />
        <View style={[styles.bubble, shadows.soft]}>
          <AppText variant="label" color={colors.pinkAccent}>
            {r.picksEyebrow}
          </AppText>
          <AppText variant="body" color={colors.ink}>
            {r.picksBody}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bubbleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tail: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: colors.surface,
  },
});
