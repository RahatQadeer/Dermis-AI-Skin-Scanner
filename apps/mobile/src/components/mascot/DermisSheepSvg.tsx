import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/src/theme';

import { SheepFace } from './SheepFace';
import { SheepHand } from './SheepHand';
import type { MascotMood } from './mascotTypes';

export type DermisSheepSvgProps = {
  size: number;
  mood?: MascotMood;
};

const C = {
  wool: colors.surface,
  shade: colors.sheepShade,
  face: colors.sheepWool,
  outline: colors.sheepOutline,
  blush: colors.sheepBlush,
  hoof: colors.sheepHoof,
  ear: colors.sheepEar,
} as const;

const FLUFF: readonly [number, number, number][] = [
  [58, 128, 26],
  [74, 108, 28],
  [100, 100, 30],
  [126, 108, 28],
  [142, 128, 26],
  [132, 150, 26],
  [100, 158, 28],
  [68, 150, 26],
  [100, 130, 34],
];

const TUFT: readonly [number, number, number][] = [
  [86, 62, 12],
  [100, 56, 13],
  [114, 62, 12],
];

/** Prototype `sheepSVG` (Dermis Skin Scanner v2) — white fluffy sheep. */
export function DermisSheepSvg({ size, mood = 'happy' }: DermisSheepSvgProps) {
  const o = C.outline;
  return (
    <Svg width={size} height={size * (172 / 160)} viewBox="20 22 160 172">
      <SheepBody outline={o} />
      <SheepFace mood={mood} outline={o} />
      {/* Prototype happy sparkles — also on Welcome idle (open eyes). */}
      {mood === 'happy' || mood === 'idle' ? <HappyExtras /> : null}
    </Svg>
  );
}

function SheepBody({ outline }: { outline: string }) {
  return (
    <>
      <Ellipse cx={100} cy={188} rx={52} ry={5} fill={outline} opacity={0.12} />
      <SheepLegs outline={outline} />
      {FLUFF.map(([x, y, r]) => (
        <Circle key={`fo-${x}-${y}`} cx={x} cy={y} r={r + 3} fill={outline} />
      ))}
      {FLUFF.map(([x, y, r]) => (
        <Circle key={`fi-${x}-${y}`} cx={x} cy={y} r={r} fill={C.wool} />
      ))}
      <Ellipse cx={100} cy={164} rx={44} ry={12} fill={C.shade} />
      <SheepHand outline={outline} />
      <SheepHeadShell outline={outline} />
    </>
  );
}

function SheepLegs({ outline }: { outline: string }) {
  return (
    <>
      {[72, 90, 110, 128].map((x) => (
        <G key={x}>
          <Rect x={x - 6} y={160} width={12} height={26} rx={6} fill={C.face} stroke={outline} strokeWidth={3} />
          <Rect x={x - 6} y={178} width={12} height={8} rx={4} fill={C.hoof} />
        </G>
      ))}
    </>
  );
}

function SheepHeadShell({ outline }: { outline: string }) {
  return (
    <>
      <G transform="rotate(-24 60 86)">
        <Ellipse cx={60} cy={86} rx={16} ry={8} fill={C.face} stroke={outline} strokeWidth={3} />
        <Ellipse cx={57} cy={86} rx={9} ry={4} fill={C.ear} />
      </G>
      <G transform="rotate(24 140 86)">
        <Ellipse cx={140} cy={86} rx={16} ry={8} fill={C.face} stroke={outline} strokeWidth={3} />
        <Ellipse cx={143} cy={86} rx={9} ry={4} fill={C.ear} />
      </G>
      <Ellipse cx={100} cy={96} rx={33} ry={29} fill={C.face} stroke={outline} strokeWidth={3} />
      {TUFT.map(([x, y, r]) => (
        <Circle key={`to-${x}`} cx={x} cy={y} r={r + 3} fill={outline} />
      ))}
      {TUFT.map(([x, y, r]) => (
        <Circle key={`ti-${x}`} cx={x} cy={y} r={r} fill={C.wool} />
      ))}
      <Path
        d="M100 52 q8 -10 2 -16 q-6 -4 -9 2"
        fill="none"
        stroke={outline}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Ellipse cx={78} cy={106} rx={6} ry={4} fill={C.blush} />
      <Ellipse cx={122} cy={106} rx={6} ry={4} fill={C.blush} />
    </>
  );
}

function HappyExtras() {
  return (
    <G fill={C.blush}>
      <Path d="M158 60 l3 6 6 1 -4.5 4 1 6 -5.5-3 -5.5 3 1-6 -4.5-4 6-1z" />
      <Circle cx={40} cy={72} r={3.5} />
    </G>
  );
}
