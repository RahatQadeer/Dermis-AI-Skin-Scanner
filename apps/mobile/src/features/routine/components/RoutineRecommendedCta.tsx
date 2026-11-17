import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing, touchTargets } from '@/src/theme';

const RECS_HREF = '/(report)/recommendations?from=routine' as Href;

/** Opens scan-ranked actives so the user can add a step to AM/PM. */
export function RoutineRecommendedCta() {
  const router = useRouter();
  const r = getCopy().screens.routine;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={r.recommendedActivesCtaA11y}
      onPress={() => router.push(RECS_HREF)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppText variant="bodyStrong" color={colors.ink} align="center">
        {r.recommendedActivesCta}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTargets.min + 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
