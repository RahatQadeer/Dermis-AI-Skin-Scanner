import Svg, { Ellipse, Path } from 'react-native-svg';

import { colors } from '@/src/theme';

type ZoneMapFaceProps = {
  width: number;
  height: number;
};

/** Soft face silhouette + faint contours (matches Results mock). */
export function ZoneMapFace({ width, height }: ZoneMapFaceProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 260" accessibilityElementsHidden>
      <Ellipse cx="100" cy="128" rx="78" ry="108" fill={colors.zoneFaceFill} />
      {/* Soft cheek shade */}
      <Ellipse cx="52" cy="145" rx="18" ry="28" fill={colors.zoneFaceShade} opacity={0.55} />
      <Ellipse cx="148" cy="145" rx="18" ry="28" fill={colors.zoneFaceShade} opacity={0.55} />
      {/* Nose bridge / tip contour */}
      <Path
        d="M100 88 C96 118, 92 138, 100 158 C108 138, 104 118, 100 88"
        fill="none"
        stroke={colors.zoneFaceLine}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {/* Brow arcs */}
      <Path
        d="M58 108 Q78 98 96 108"
        fill="none"
        stroke={colors.zoneFaceLine}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path
        d="M104 108 Q122 98 142 108"
        fill="none"
        stroke={colors.zoneFaceLine}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      {/* Jaw hint */}
      <Path
        d="M62 198 Q100 218 138 198"
        fill="none"
        stroke={colors.zoneFaceLine}
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
}
