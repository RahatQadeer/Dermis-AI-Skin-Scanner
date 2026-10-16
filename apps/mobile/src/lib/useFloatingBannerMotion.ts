import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { motion } from '@/src/theme';

type FloatingBannerMotionOptions = {
  visible: boolean;
  durationMs: number;
  onDismiss: () => void;
  hiddenOffsetY?: number;
};

export function useFloatingBannerMotion({
  visible,
  durationMs,
  onDismiss,
  hiddenOffsetY = 18,
}: FloatingBannerMotionOptions) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(hiddenOffsetY);

  useEffect(() => {
    if (!visible) {
      if (reduceMotion) {
        opacity.value = 0;
        translateY.value = hiddenOffsetY;
      } else {
        opacity.value = withTiming(0, { duration: motion.duration.fast });
        translateY.value = withTiming(hiddenOffsetY, { duration: motion.duration.fast });
      }
      return;
    }
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
    } else {
      opacity.value = withTiming(1, {
        duration: motion.duration.normal,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: motion.duration.normal,
        easing: Easing.out(Easing.cubic),
      });
    }
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onDismiss, hiddenOffsetY, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}
