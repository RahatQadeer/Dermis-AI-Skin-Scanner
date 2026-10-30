import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

/** Entry point to the skincare assistant (Home, Results). */
export function AssistantEntryCard() {
  const a = getCopy().screens.assistant;
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${a.openCta}. ${a.openCtaHint}`}
      onPress={() => router.push('/assistant')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Mascot mood="happy" size={44} showBubble={false} />
      <View style={styles.text}>
        <AppText variant="bodyStrong">{a.openCta}</AppText>
        <AppText variant="caption" color={colors.muteBody}>
          {a.openCtaHint}
        </AppText>
      </View>
      <AppText variant="headline" color={colors.muteBody}>
        ›
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: { opacity: 0.85 },
  text: { flex: 1, gap: 2 },
});
