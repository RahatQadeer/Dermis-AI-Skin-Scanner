import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors, motion, radii } from '@/src/theme';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  rounded?: boolean;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 16, rounded = true, style }: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.45;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: motion.duration.slow }), -1, true);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: rounded ? radii.md : radii.none,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.border,
  },
});
