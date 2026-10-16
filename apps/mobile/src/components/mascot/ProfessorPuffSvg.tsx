import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { colors } from '@/src/theme';

import {
  AnimatedBookArm,
  AnimatedEar,
  AnimatedHappyStar,
} from './ProfessorPuffMotion';
import type { MascotMood } from './mascotTypes';

export type ProfessorPuffSvgProps = {
  size: number;
  mood?: MascotMood;
};

/** Prototype illustration-only palette (humanSVG / Professor Puff). */
const P = {
  outline: colors.sheepOutline,
  wool: colors.surface,
  face: colors.sheepWool,
  blush: colors.sheepBlush,
  skin: colors.professorSkin,
  cardigan: colors.professorCardigan,
  trousers: colors.professorTrousers,
  horn: colors.professorHorn,
  shoe: colors.sheepWool,
  shirt: colors.surface,
  bow: colors.professorBow,
  bowCenter: colors.professorBowCenter,
  button: colors.professorButton,
  pocket: colors.professorPocket,
  glasses: colors.professorGlasses,
  mouthPink: colors.professorMouth,
} as const;

const HAIR_BACK: readonly [number, number, number][] = [
  [72, 72, 15],
  [84, 58, 16],
  [100, 52, 17],
  [116, 58, 16],
  [128, 72, 15],
  [70, 90, 11],
  [130, 90, 11],
];

const FRINGE: readonly [number, number, number][] = [
  [83, 67, 10],
  [100, 63, 11],
  [117, 67, 10],
];

/** Prototype `humanSVG` (Professor Puff) — glasses, cardigan, bowtie, book. */
export function ProfessorPuffSvg({ size, mood = 'happy' }: ProfessorPuffSvgProps) {
  return (
    <Svg width={size} height={size * (172 / 160)} viewBox="20 22 160 172">
      <Ellipse cx={100} cy={189} rx={40} ry={4.5} fill={P.outline} opacity={0.12} />
      <Limb d="M90 160 L90 180" color={P.trousers} width={13} />
      <Limb d="M110 160 L110 180" color={P.trousers} width={13} />
      <Ellipse cx={87} cy={185} rx={10} ry={5} fill={P.shoe} stroke={P.outline} strokeWidth={3} />
      <Ellipse cx={113} cy={185} rx={10} ry={5} fill={P.shoe} stroke={P.outline} strokeWidth={3} />
      <Limb d="M80 128 Q70 144 68 158" color={P.cardigan} width={13} />
      <Path
        d="M72 168 Q70 130 85 120 L115 120 Q130 130 128 168 Z"
        fill={P.cardigan}
        stroke={P.outline}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M90 120 L100 142 L110 120 Z"
        fill={P.shirt}
        stroke={P.outline}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path d="M100 142 L100 168" stroke={P.outline} strokeWidth={2} />
      <Circle cx={96} cy={150} r={2.2} fill={P.button} />
      <Circle cx={96} cy={160} r={2.2} fill={P.button} />
      <Path d="M74 152 h16 M110 152 h16" stroke={P.pocket} strokeWidth={2} strokeDasharray="2 3" />
      <Circle cx={68} cy={162} r={7} fill={P.skin} stroke={P.outline} strokeWidth={3} />
      <BowTie />
      <WoolRing points={HAIR_BACK} />
      <AnimatedEar side="left" />
      <AnimatedEar side="right" />
      <Ellipse cx={100} cy={93} rx={29} ry={28} fill={P.skin} stroke={P.outline} strokeWidth={3} />
      <Horn x={70} flip={-1} />
      <Horn x={130} flip={1} />
      <WoolRing points={FRINGE} />
      <Ellipse cx={79} cy={103} rx={5.5} ry={3.6} fill={P.blush} />
      <Ellipse cx={121} cy={103} rx={5.5} ry={3.6} fill={P.blush} />
      <ProfessorEyes mood={mood} />
      <Glasses />
      <ProfessorMouth mood={mood} />
      <AnimatedBookArm />
      {mood === 'happy' || mood === 'idle' ? <AnimatedHappyStar /> : null}
    </Svg>
  );
}

function Limb({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <>
      <Path d={d} fill="none" stroke={P.outline} strokeWidth={width + 6} strokeLinecap="round" />
      <Path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}

function WoolRing({ points }: { points: readonly [number, number, number][] }) {
  return (
    <>
      {points.map(([x, y, r]) => (
        <Circle key={`o-${x}-${y}`} cx={x} cy={y} r={r + 3} fill={P.outline} />
      ))}
      {points.map(([x, y, r]) => (
        <Circle key={`i-${x}-${y}`} cx={x} cy={y} r={r} fill={P.wool} />
      ))}
    </>
  );
}

function Horn({ x, flip }: { x: number; flip: number }) {
  return (
    <G transform={`translate(${x} 60) scale(${flip} 1)`}>
      <Circle r={8.5} fill={P.horn} stroke={P.outline} strokeWidth={3} />
      <Path
        d="M-1 3 q-4 -3 0 -6 q5 -2 6 3"
        fill="none"
        stroke={P.outline}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </G>
  );
}

function BowTie() {
  return (
    <G>
      <Path
        d="M100 124 L89 117 L89 131 Z"
        fill={P.bow}
        stroke={P.outline}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <Path
        d="M100 124 L111 117 L111 131 Z"
        fill={P.bow}
        stroke={P.outline}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <Circle cx={100} cy={124} r={4} fill={P.bowCenter} stroke={P.outline} strokeWidth={2.6} />
    </G>
  );
}

function Glasses() {
  return (
    <G fill="none" stroke={P.glasses} strokeWidth={2.8}>
      <Circle cx={89} cy={93} r={9.5} />
      <Circle cx={111} cy={93} r={9.5} />
      <Path d="M98.5 92 q1.5 -2.6 3 0" strokeLinecap="round" />
    </G>
  );
}

function ProfessorEyes({ mood }: { mood: MascotMood }) {
  if (mood === 'happy') {
    return (
      <>
        <Path
          d="M84 95 Q89 87 94 95"
          fill="none"
          stroke={P.outline}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Path
          d="M106 95 Q111 87 116 95"
          fill="none"
          stroke={P.outline}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </>
    );
  }
  if (mood === 'wink') {
    return (
      <>
        <OpenEye x={89} />
        <Path
          d="M106 95 Q111 87 116 95"
          fill="none"
          stroke={P.outline}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </>
    );
  }
  return (
    <>
      <OpenEye x={89} />
      <OpenEye x={111} />
    </>
  );
}

function OpenEye({ x }: { x: number }) {
  return (
    <>
      <Circle cx={x} cy={93} r={4.6} fill={P.outline} />
      <Circle cx={x + 1.6} cy={91.4} r={1.6} fill={P.wool} />
    </>
  );
}

function ProfessorMouth({ mood }: { mood: MascotMood }) {
  if (mood === 'happy') {
    return (
      <>
        <Path
          d="M93 105 Q100 115 107 105 Z"
          fill={P.outline}
          stroke={P.outline}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Path d="M96.5 109.5 Q100 112.5 103.5 109.5" fill={P.mouthPink} />
      </>
    );
  }
  return (
    <Path
      d="M94 105 Q100 111 106 105"
      fill="none"
      stroke={P.outline}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  );
}
