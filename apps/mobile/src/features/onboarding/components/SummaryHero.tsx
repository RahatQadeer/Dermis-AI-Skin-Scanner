import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ProfessorPuffSvg } from '@/src/components/mascot/ProfessorPuffSvg';
import { useMascotMotion } from '@/src/components/mascot/useMascotMotion';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { clampFont, colors, fontFamilies, useResponsive } from '@/src/theme';

const SHEEP_SIZE = 140;

export function SummaryHero() {
  const summary = getCopy().screens.summary;
  const { style: bobStyle } = useMascotMotion('bob');
  const { width } = useResponsive();
  const headlineSize = clampFont(30, width);

  return (
    <View style={styles.hero}>
      <Animated.View style={bobStyle}>
        <ProfessorPuffSvg size={SHEEP_SIZE} mood="happy" />
      </Animated.View>
      <AppText style={styles.eyebrow} color={colors.quizEyebrow}>
        {summary.eyebrow}
      </AppText>
      <AppText
        style={[styles.headline, { fontSize: headlineSize, lineHeight: Math.round(headlineSize * 1.07) }]}
        color={colors.ink}
        accessibilityRole="header"
      >
        {summary.headline}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 56,
  },
  eyebrow: {
    marginTop: 26,
    fontFamily: fontFamilies.bodyExtraBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.96,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headline: {
    marginTop: 6,
    fontFamily: fontFamilies.heading,
    fontSize: 30,
    lineHeight: 32,
    textAlign: 'center',
  },
});
