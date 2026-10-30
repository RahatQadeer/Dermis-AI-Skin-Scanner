import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors, scaleHeight, useResponsive } from '@/src/theme';

/** Party-popper confetti behind sheep — denser burst, two waves. */
const CONFETTI_COLORS = [
  colors.pinkBright,
  colors.confettiMint,
  colors.confettiAmber,
  colors.confettiSky,
  colors.surface,
  colors.pink,
] as const;

const PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 29 + 4) % 96}%` as const,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  durationMs: Math.round((1.8 + (i % 5) * 0.28) * 1000),
  delayMs: Math.round((i % 8) * 0.09 * 1000),
  width: i % 3 === 0 ? 10 : 8,
  height: i % 3 === 0 ? 16 : 13,
}));

function runConfettiBurst(
  delayMs: number,
  durationMs: number,
  values: {
    opacity: SharedValue<number>;
    translateY: SharedValue<number>;
    rotate: SharedValue<number>;
  },
) {
  const fadeOutMs = Math.round(durationMs * 0.22);
  const visibleMs = durationMs - fadeOutMs;
  const fall = Easing.in(Easing.quad);
  const gapMs = 400;

  values.opacity.value = withDelay(
    delayMs,
    withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(1, { duration: visibleMs }),
      withTiming(0, { duration: fadeOutMs }),
      withTiming(0, { duration: gapMs }),
      withTiming(1, { duration: 60 }),
      withTiming(1, { duration: visibleMs }),
      withTiming(0, { duration: fadeOutMs }),
    ),
  );
  values.translateY.value = withDelay(
    delayMs,
    withSequence(
      withTiming(520, { duration: durationMs, easing: fall }),
      withTiming(-20, { duration: 1 }),
      withTiming(-20, { duration: gapMs }),
      withTiming(520, { duration: durationMs, easing: fall }),
    ),
  );
  values.rotate.value = withDelay(
    delayMs,
    withSequence(
      withTiming(640, { duration: durationMs, easing: Easing.linear }),
      withTiming(0, { duration: 1 }),
      withTiming(0, { duration: gapMs }),
      withTiming(640, { duration: durationMs, easing: Easing.linear }),
    ),
  );
}

function ConfettiPiece({
  left,
  color,
  durationMs,
  delayMs,
  width,
  height,
}: (typeof PIECES)[number]) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(-20);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0;
      return;
    }
    runConfettiBurst(delayMs, durationMs, { opacity, translateY, rotate });
  }, [delayMs, durationMs, opacity, reduceMotion, rotate, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.piece, { left, width, height, backgroundColor: color }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export function SummaryConfetti() {
  // Cap the burst zone on short screens so it doesn't dominate the viewport.
  const { height } = useResponsive();
  return (
    <View pointerEvents="none" style={[styles.host, { height: scaleHeight(420, height, 0.6) }]}>
      {PIECES.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: -16,
    borderRadius: 2,
  },
});
