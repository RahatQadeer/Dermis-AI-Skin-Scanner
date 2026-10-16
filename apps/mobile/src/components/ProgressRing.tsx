import { scoreColor } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/src/components/text/AppText';
import { clampScore } from '@/src/lib/clampScore';
import { scoreTokenToColor } from '@/src/lib/scoreTokenToColor';
import { colors } from '@/src/theme';

export type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  accessibilityLabel?: string;
};

export function ProgressRing({
  progress,
  size = 88,
  strokeWidth = 8,
  label,
  accessibilityLabel,
}: ProgressRingProps) {
  const clamped = clampScore(progress);
  const stroke = scoreTokenToColor(scoreColor(clamped));
  const a11y = accessibilityLabel ?? label ?? `Progress ${String(clamped)} of 100`;

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityLabel={a11y}
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
    >
      <RingSvg size={size} strokeWidth={strokeWidth} progress={clamped} stroke={stroke} />
      <View style={styles.center} pointerEvents="none">
        <AppText variant="headline" color={stroke} align="center">
          {label ?? String(clamped)}
        </AppText>
      </View>
    </View>
  );
}

function RingSvg(props: { size: number; strokeWidth: number; progress: number; stroke: string }) {
  const radius = (props.size - props.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - props.progress / 100);
  const center = props.size / 2;

  return (
    <Svg width={props.size} height={props.size}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={colors.border}
        strokeWidth={props.strokeWidth}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${center}, ${center}`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
