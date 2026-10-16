import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors } from '@/src/theme';

export type WelcomeScanDotProps = {
  left: `${number}%`;
  top: `${number}%`;
  delayMs?: number;
};

/** Prototype landmark pulse (soft pink halo + white core). */
export function WelcomeScanDot({ left, top, delayMs = 0 }: WelcomeScanDotProps) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = 1;
    opacity.value = 0.55;
    if (reduceMotion) {
      return;
    }
    scale.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1.35, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, opacity, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.dot, { left, top }, style]}
      accessibilityElementsHidden
    >
      <View style={styles.core} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    marginTop: -7,
    borderRadius: 7,
    backgroundColor: 'rgba(233, 132, 154, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
});
