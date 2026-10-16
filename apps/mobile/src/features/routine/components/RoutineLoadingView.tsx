import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

/** Centered hold state — no routine content until the server load finishes. */
export function RoutineLoadingView() {
  const r = getCopy().screens.routine;
  return (
    <View style={styles.wrap} accessibilityLabel={r.loadingA11y} accessibilityRole="progressbar">
      <View style={styles.card}>
        <Mascot mood="idle" size={72} showBubble={false} />
        <ActivityIndicator color={colors.pinkBright} size="large" />
        <AppText variant="caption" color={colors.mute} align="center">
          {r.loadingA11y}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    minWidth: 200,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
});
