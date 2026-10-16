import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/src/theme';

export type TabBarIconProps = {
  color: string;
  active?: boolean;
  size?: number;
};

export function HomeTabIcon({ color, size = 22 }: TabBarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-4v6H5.5a1 1 0 0 1-1-1v-9.5Z"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProgressTabIcon({ color, size = 22 }: TabBarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M4 18V6M4 18h16"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M7 14.5 11 10l3 3 5-6"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Serum bottle — prototype tab: short cap, neck, rounded flask body, pink fill when active. */
export function RoutineTabIcon({ color, active = false, size = 22 }: TabBarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      {active ? (
        <Path
          d="M8.25 14.2c0-.2.05-.4.15-.55l.7-.95h5.8l.7.95c.1.15.15.35.15.55V19c0 1.4-1.1 2.5-2.5 2.5h-2.5c-1.4 0-2.5-1.1-2.5-2.5v-4.8Z"
          fill={colors.pinkBright}
        />
      ) : null}
      <Path
        d="M9.5 3.2h5c.55 0 1 .45 1 1v1.1c0 .55-.45 1-1 1h-.35v1.35c0 .35.12.68.35.95l1.55 1.85c.35.42.55.95.55 1.5V19c0 1.66-1.34 3-3 3h-2.4c-1.66 0-3-1.34-3-3v-6.05c0-.55.2-1.08.55-1.5l1.55-1.85c.23-.27.35-.6.35-.95V6.3H9.5c-.55 0-1-.45-1-1V4.2c0-.55.45-1 1-1Z"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M9.2 6.3h5.6"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileTabIcon({ color, size = 22 }: TabBarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Circle cx={12} cy={8} r={3.4} fill="none" stroke={color} strokeWidth={1.8} />
      <Path
        d="M5.5 19.5c1.2-3.2 3.4-4.8 6.5-4.8s5.3 1.6 6.5 4.8"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
