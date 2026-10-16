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
import { colors } from '@/src/theme';

/** Full-screen party-popper confetti (same palette as profile summary). */
const CONFETTI_COLORS = [
  colors.pinkBright,
  colors.confettiMint,
  colors.confettiAmber,
  colors.confettiSky,
  colors.surface,
  colors.pink,
] as const;

const PIECES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 3) % 97}%` as const,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  durationMs: Math.round((1.5 + (i % 5) * 0.22) * 1000),
  delayMs: Math.round((i % 10) * 0.07 * 1000),
  width: i % 3 === 0 ? 10 : 7,
  height: i % 3 === 0 ? 16 : 12,
}));

function runFall(
  delayMs: number,
  durationMs: number,
  values: {
    opacity: SharedValue<number>;
    translateY: SharedValue<number>;
    rotate: SharedValue<number>;
  },
) {
  const fadeOutMs = Math.round(durationMs * 0.24);
  const visibleMs = durationMs - fadeOutMs;
  const fall = Easing.in(Easing.quad);

  values.opacity.value = withDelay(
    delayMs,
    withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(1, { duration: visibleMs }),
      withTiming(0, { duration: fadeOutMs }),
    ),
  );
  values.translateY.value = withDelay(
    delayMs,
    withTiming(720, { duration: durationMs, easing: fall }),
  );
  values.rotate.value = withDelay(
    delayMs,
    withTiming(720, { duration: durationMs, easing: Easing.linear }),
  );
}

function ConfettiPiece(props: (typeof PIECES)[number]) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(-24);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0;
      return;
    }
    runFall(props.delayMs, props.durationMs, { opacity, translateY, rotate });
  }, [opacity, props.delayMs, props.durationMs, reduceMotion, rotate, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: props.left,
          width: props.width,
          height: props.height,
          backgroundColor: props.color,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export type PartyConfettiProps = {
  active: boolean;
  /** Remount key so each Done press replays the burst. */
  burstKey?: number | string;
};

export function PartyConfetti({ active, burstKey = 0 }: PartyConfettiProps) {
  if (!active) {
    return null;
  }
  return (
    <View pointerEvents="none" style={styles.host} key={String(burstKey)}>
      {PIECES.map((piece) => (
        <ConfettiPiece key={`${String(burstKey)}-${String(piece.id)}`} {...piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: -20,
    borderRadius: 2,
  },
});
