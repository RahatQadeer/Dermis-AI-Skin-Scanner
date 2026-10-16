import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, shadows } from '@/src/theme';

export type WelcomeCtaProps = {
  onPress: () => void;
};

/** Prototype CTA: 60px ink pill, Nunito 700 16, pink 44 arrow tile. */
export function WelcomeCta({ onPress }: WelcomeCtaProps) {
  const w = getCopy().screens.welcome;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={w.cta}
      onPress={onPress}
      style={({ pressed }) => [styles.button, shadows.card, pressed ? styles.pressed : null]}
    >
      <AppText style={styles.label} color={colors.surface}>
        {w.cta}
      </AppText>
      <View style={styles.arrow} accessibilityElementsHidden>
        <AppText style={styles.arrowGlyph} color={colors.ink}>
          {w.ctaArrow}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    /** Prototype: 18px under stats row. */
    marginTop: 18,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  label: {
    flexShrink: 1,
    fontFamily: fontFamilies.bodyBold,
    fontSize: 16,
    lineHeight: 20,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pinkBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 20,
  },
});
