import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors, motion } from '@/src/theme';

export type FlashOverlayProps = {
  visible: boolean;
  onFinished: () => void;
};

export function FlashOverlay({ visible, onFinished }: FlashOverlayProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(0);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!visible) {
      opacity.value = 0;
      return;
    }
    if (reduceMotion) {
      onFinishedRef.current();
      return;
    }
    opacity.value = 1;
    opacity.value = withTiming(0, { duration: motion.duration.flash });
    const timer = setTimeout(() => onFinishedRef.current(), motion.duration.flash);
    return () => clearTimeout(timer);
  }, [visible, reduceMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) {
    return null;
  }

  return <Animated.View pointerEvents="none" style={[styles.flash, style]} />;
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    zIndex: 20,
  },
});
