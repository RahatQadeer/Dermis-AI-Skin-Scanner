import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { colors } from '@/src/theme';

/** Compact sheep head for tab scan FAB and quiz progress. */
export function SheepHeadMark({ size = 30 }: { size?: number }) {
  const o = colors.sheepOutline;
  const face = colors.sheepWool;
  const ear = colors.sheepEar;
  const blush = colors.sheepBlush;
  const h = size * (26 / 30);

  return (
    <Svg width={size} height={h} viewBox="38 34 124 98" accessibilityElementsHidden>
      <G transform="rotate(-24 60 86)">
        <Ellipse cx={60} cy={86} rx={16} ry={8} fill={face} stroke={o} strokeWidth={5} />
        <Ellipse cx={57} cy={86} rx={9} ry={4} fill={ear} />
      </G>
      <G transform="rotate(24 140 86)">
        <Ellipse cx={140} cy={86} rx={16} ry={8} fill={face} stroke={o} strokeWidth={5} />
        <Ellipse cx={143} cy={86} rx={9} ry={4} fill={ear} />
      </G>
      <Ellipse cx={100} cy={96} rx={33} ry={29} fill={face} stroke={o} strokeWidth={5} />
      <Circle cx={84} cy={64} r={17} fill={o} />
      <Circle cx={100} cy={56} r={18} fill={o} />
      <Circle cx={116} cy={64} r={17} fill={o} />
      <Circle cx={84} cy={64} r={13} fill={colors.surface} />
      <Circle cx={100} cy={56} r={14} fill={colors.surface} />
      <Circle cx={116} cy={64} r={13} fill={colors.surface} />
      <Path
        d="M81 97 Q87 89 93 97M107 97 Q113 89 119 97"
        fill="none"
        stroke={colors.surface}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <Ellipse cx={78} cy={108} rx={6} ry={4} fill={blush} />
      <Ellipse cx={122} cy={108} rx={6} ry={4} fill={blush} />
    </Svg>
  );
}
