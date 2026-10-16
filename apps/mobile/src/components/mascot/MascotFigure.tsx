import { View } from 'react-native';

import { DermisSheepSvg } from './DermisSheepSvg';
import { ProfessorPuffSvg } from './ProfessorPuffSvg';
import type { MascotCharacter, MascotMood } from './mascotTypes';

export type MascotFigureProps = {
  character: MascotCharacter;
  mood: MascotMood;
  size: number;
};

/** Dermis = sheep SVG; Professor Puff = prototype humanSVG. */
export function MascotFigure({ character, mood, size }: MascotFigureProps) {
  const aspect = size * (172 / 160);

  return (
    <View
      style={{ width: size, height: aspect }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {character === 'dermis' ? (
        <DermisSheepSvg size={size} mood={mood} />
      ) : (
        <ProfessorPuffSvg size={size} mood={mood} />
      )}
    </View>
  );
}
