import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { motion } from '@/src/theme';

import type { MascotMotionKind } from './mascotTypes';

const EASE = Easing.inOut(Easing.ease);

type MotionValues = {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scaleY: SharedValue<number>;
  rotate: SharedValue<number>;
};

/** Prototype `@keyframes bob` — 3.2s ease-in-out (welcome sheep). */
function runBob(values: MotionValues) {
  const half = 1600;
  values.translateY.value = withRepeat(
    withSequence(
      withTiming(-6, { duration: half, easing: EASE }),
      withTiming(0, { duration: half, easing: EASE }),
    ),
    -1,
    false,
  );
  values.rotate.value = withRepeat(
    withSequence(
      withTiming(1.5, { duration: half, easing: EASE }),
      withTiming(-1.5, { duration: half, easing: EASE }),
    ),
    -1,
    false,
  );
}

function runMotion(kind: MascotMotionKind, values: MotionValues) {
  if (kind === 'sway') {
    values.translateX.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 1600, easing: EASE }),
        withTiming(-8, { duration: 1600, easing: EASE }),
      ),
      -1,
      false,
    );
    return;
  }
  if (kind === 'bob') {
    runBob(values);
    return;
  }
  if (kind === 'hop') {
    values.translateY.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: motion.duration.normal }),
        withTiming(0, { duration: motion.duration.normal }),
      ),
      -1,
      false,
    );
    return;
  }
  values.scaleY.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 1600 }),
      withTiming(0.15, { duration: motion.duration.fast }),
      withTiming(1, { duration: motion.duration.fast }),
    ),
    -1,
    false,
  );
}

export function useMascotMotion(kind: MascotMotionKind) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scaleY = useSharedValue(1);
  const rotate = useSharedValue(-1.5);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = 0;
    translateX.value = 0;
    scaleY.value = 1;
    rotate.value = -1.5;
    opacity.value = 1;
    if (reduceMotion || kind === 'none') {
      return;
    }
    runMotion(kind, { translateX, translateY, scaleY, rotate });
  }, [kind, opacity, reduceMotion, rotate, scaleY, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scaleY: scaleY.value },
    ],
    opacity: opacity.value,
  }));

  return { style, reduceMotion };
}
