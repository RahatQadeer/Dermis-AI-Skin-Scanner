import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/src/components/text/AppText';
import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors, fontFamilies, radii, shadows, spacing } from '@/src/theme';

export type WelcomeScoreChipProps = {
  score: string;
  label: string;
  tone: 'green' | 'amber';
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
};

/** Prototype score pill with soft float (5s loop). */
export function WelcomeScoreChip({
  score,
  label,
  tone,
  delayMs = 0,
  style,
}: WelcomeScoreChipProps) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(0);
  const fill = tone === 'green' ? colors.greenSoft : colors.amberSoft;
  const scoreColor = tone === 'green' ? colors.greenDeep : colors.amberDeep;

  useEffect(() => {
    translateY.value = 0;
    if (reduceMotion) {
      return;
    }
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, reduceMotion, translateY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.chip, shadows.soft, style, floatStyle]}>
      <View style={[styles.scoreDot, { backgroundColor: fill }]}>
        <AppText style={[styles.scoreText, { color: scoreColor }]}>{score}</AppText>
      </View>
      <AppText style={styles.chipLabel} color={colors.ink}>
        {label}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    zIndex: 5,
  },
  scoreDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontFamily: fontFamilies.heading,
    fontSize: 13,
    lineHeight: 13,
  },
  chipLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 12,
    lineHeight: 14,
  },
});
