import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { G, Path } from 'react-native-svg';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors } from '@/src/theme';

const AnimatedG = Animated.createAnimatedComponent(G);
const IS_WEB = Platform.OS === 'web';

/**
 * Prototype (exact):
 *   @keyframes wag {
 *     0%, 100% { transform: rotate(-6deg) }
 *     50%      { transform: rotate(16deg) }
 *   }
 *   animation: wag 1.4s ease-in-out infinite
 *   transform-box: fill-box; transform-origin: 0% 30%
 *
 * Motion: soft half-circle around the wrist (left of the paw).
 * Path stays put at the wrist — only the tip sweeps the arc.
 */
const WAG_HALF_MS = 700;
const WAG_FROM = -6;
const WAG_TO = 16;
/** fill-box origin ≈ 0% x, 30% y of path bbox (~146×130 → 160×150) */
const PIVOT_X = 146;
const PIVOT_Y = 136;
const SMOOTH = Easing.inOut(Easing.ease);

export type SheepHandProps = {
  outline: string;
};

/** Prototype-matched wrist half-circle wave. */
export function SheepHand({ outline }: SheepHandProps) {
  const reduceMotion = useReduceMotion();
  const rotate = useRef(new Animated.Value(WAG_FROM)).current;

  useEffect(() => {
    rotate.setValue(WAG_FROM);
    if (reduceMotion || IS_WEB) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: WAG_TO,
          duration: WAG_HALF_MS,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
        Animated.timing(rotate, {
          toValue: WAG_FROM,
          duration: WAG_HALF_MS,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [reduceMotion, rotate]);

  const paw = (
    <Path
      d="M146 132 q14 -2 12 10 q-2 8 -10 4"
      fill={colors.surface}
      stroke={outline}
      strokeWidth={3}
    />
  );

  // Animated SVG `rotation` is unreliable on web — keep a static paw there.
  if (IS_WEB || reduceMotion) {
    return paw;
  }

  // Translate → rotate around 0,0 → translate back.
  // More reliable than Animated originX/originY (which can orbit wrong).
  return (
    <G x={PIVOT_X} y={PIVOT_Y}>
      <AnimatedG rotation={rotate}>
        <G x={-PIVOT_X} y={-PIVOT_Y}>
          {paw}
        </G>
      </AnimatedG>
    </G>
  );
}
