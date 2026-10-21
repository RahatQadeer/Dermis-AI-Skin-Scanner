import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors } from '@/src/theme';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
/** Animated SVG props are unreliable under react-native-web. */
const IS_WEB = Platform.OS === 'web';

const SMOOTH = Easing.inOut(Easing.ease);

const P = {
  outline: colors.sheepOutline,
  ear: colors.sheepEar,
  face: colors.sheepWool,
  blush: colors.sheepBlush,
  skin: colors.professorSkin,
  cardigan: colors.professorCardigan,
  book: colors.professorBook,
  bookPage: colors.professorBookPage,
} as const;

type EarSide = 'left' | 'right';

const EAR = {
  left: {
    cx: 60,
    innerX: 57,
    baseRot: -28,
    peak: -12,
    cycleMs: 3800,
    stillRatio: 0.78,
    peakRatio: 0.86,
  },
  right: {
    cx: 140,
    innerX: 143,
    baseRot: 28,
    peak: 12,
    cycleMs: 4400,
    stillRatio: 0.7,
    peakRatio: 0.8,
  },
} as const;

type EarCfg = (typeof EAR)[EarSide];

function EarGraphics({ cfg, pivotY }: { cfg: EarCfg; pivotY: number }) {
  return (
    <G rotation={cfg.baseRot} origin={`${cfg.cx}, ${pivotY}`}>
      <Ellipse
        cx={cfg.cx}
        cy={pivotY}
        rx={13}
        ry={6.5}
        fill={P.face}
        stroke={P.outline}
        strokeWidth={3}
      />
      <Ellipse cx={cfg.innerX} cy={pivotY} rx={7} ry={3} fill={P.ear} />
    </G>
  );
}

/**
 * Exact prototype earL / earR:
 *   earL 3.8s: 0 → −12° at 86%; earR 4.4s: 0 → +12° at 80%
 *   origin fill-box 90%/10% 50% — flap from head attach
 */
export function AnimatedEar({ side }: { side: EarSide }) {
  const reduceMotion = useReduceMotion();
  const cfg = EAR[side];
  const pivotX = cfg.cx - 13 + (side === 'left' ? 0.9 : 0.1) * 26;
  const pivotY = 98;
  const stillMs = Math.round(cfg.cycleMs * cfg.stillRatio);
  const toPeakMs = Math.round(cfg.cycleMs * (cfg.peakRatio - cfg.stillRatio));
  const backMs = cfg.cycleMs - stillMs - toPeakMs;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotate.setValue(0);
    if (reduceMotion || IS_WEB) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(stillMs),
        Animated.timing(rotate, {
          toValue: cfg.peak,
          duration: toPeakMs,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: backMs,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [backMs, cfg.peak, reduceMotion, rotate, stillMs, toPeakMs]);

  const ear = <EarGraphics cfg={cfg} pivotY={pivotY} />;
  if (IS_WEB || reduceMotion) return ear;
  return (
    <G x={pivotX} y={pivotY}>
      <AnimatedG rotation={rotate}>
        <G x={-pivotX} y={-pivotY}>
          {ear}
        </G>
      </AnimatedG>
    </G>
  );
}

function BookArmGraphics() {
  return (
    <>
      <Limb d="M120 128 Q132 138 134 150" color={P.cardigan} width={13} />
      <G rotation={12} origin="138, 150">
        <Rect
          x={124}
          y={136}
          width={28}
          height={22}
          rx={3}
          fill={P.book}
          stroke={P.outline}
          strokeWidth={3}
        />
        <Rect
          x={128}
          y={155}
          width={22}
          height={4.5}
          fill={P.bookPage}
          stroke={P.outline}
          strokeWidth={2}
        />
        <Path
          d="M130 143 h14 M130 148 h9"
          stroke={P.bookPage}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </G>
      <Circle cx={134} cy={152} r={7} fill={P.skin} stroke={P.outline} strokeWidth={3} />
    </>
  );
}

/** Prototype book arm `float 3s` — translateY 0 ↔ -6. */
export function AnimatedBookArm() {
  const reduceMotion = useReduceMotion();
  const ty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ty.setValue(0);
    if (reduceMotion || IS_WEB) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ty, {
          toValue: -6,
          duration: 1500,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
        Animated.timing(ty, {
          toValue: 0,
          duration: 1500,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, ty]);

  const bookArm = <BookArmGraphics />;
  if (IS_WEB || reduceMotion) return <G>{bookArm}</G>;
  return <AnimatedG translateY={ty}>{bookArm}</AnimatedG>;
}

/** Prototype happy star `pulse 1.6s` — opacity 0.35 ↔ 1. */
export function AnimatedHappyStar() {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(0.35)).current;
  const starPath = 'M158 60 l3 6 6 1 -4.5 4 1 6 -5.5-3 -5.5 3 1-6 -4.5-4 6-1z';

  useEffect(() => {
    opacity.setValue(0.35);
    if (reduceMotion || IS_WEB) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          easing: SMOOTH,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  if (IS_WEB || reduceMotion) {
    return <Path d={starPath} fill={P.blush} opacity={0.7} />;
  }
  return <AnimatedPath d={starPath} fill={P.blush} opacity={opacity} />;
}

function Limb({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <>
      <Path d={d} fill="none" stroke={P.outline} strokeWidth={width + 6} strokeLinecap="round" />
      <Path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}
