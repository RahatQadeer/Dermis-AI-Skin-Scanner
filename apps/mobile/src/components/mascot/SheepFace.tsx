import { Circle, Path } from 'react-native-svg';

import { colors } from '@/src/theme';

import type { MascotMood } from './mascotTypes';

export function SheepFace({ mood, outline }: { mood: MascotMood; outline: string }) {
  if (mood === 'happy') {
    return <HappyFace />;
  }
  if (mood === 'wink') {
    return <WinkFace outline={outline} />;
  }
  return <DefaultFace outline={outline} />;
}

function HappyFace() {
  return (
    <>
      <Path
        d="M81 97 Q87 88 93 97"
        fill="none"
        stroke={colors.surface}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <Path
        d="M107 97 Q113 88 119 97"
        fill="none"
        stroke={colors.surface}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <Path
        d="M93 106 Q100 116 107 106 Z"
        fill={colors.surface}
        stroke={colors.surface}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </>
  );
}

function WinkFace({ outline }: { outline: string }) {
  return (
    <>
      <Circle cx={87} cy={94} r={7.5} fill={colors.surface} />
      <Circle cx={88} cy={95} r={4.8} fill={outline} />
      <Circle cx={89.6} cy={92.6} r={1.9} fill={colors.surface} />
      <Path
        d="M107 97 Q113 88 119 97"
        fill="none"
        stroke={colors.surface}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <Path
        d="M94 105 Q101 112 107 104"
        fill="none"
        stroke={colors.surface}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </>
  );
}

function DefaultFace({ outline }: { outline: string }) {
  return (
    <>
      <Circle cx={87} cy={94} r={7.5} fill={colors.surface} />
      <Circle cx={88} cy={95} r={4.8} fill={outline} />
      <Circle cx={89.6} cy={92.6} r={1.9} fill={colors.surface} />
      <Circle cx={113} cy={94} r={7.5} fill={colors.surface} />
      <Circle cx={114} cy={95} r={4.8} fill={outline} />
      <Circle cx={115.6} cy={92.6} r={1.9} fill={colors.surface} />
      <Path
        d="M94 106 Q97 110 100 106 Q103 110 106 106"
        fill="none"
        stroke={colors.surface}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}
