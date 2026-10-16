import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/src/components/text/AppText';
import { clampScore } from '@/src/lib/clampScore';
import { xForIndex, yForValue } from '@/src/lib/trendPolyline';
import { colors, spacing } from '@/src/theme';

export type ProgressAreaChartProps = {
  values: readonly number[];
  startLabel: string;
  endLabel: string;
  height?: number;
};

const WIDTH = 300;
const PAD = 12;

export function ProgressAreaChart({
  values,
  startLabel,
  endLabel,
  height = 128,
}: ProgressAreaChartProps) {
  const points = values.map(clampScore);
  const line = points
    .map((value, index) => {
      const cmd = index === 0 ? 'M' : 'L';
      return `${cmd} ${String(xForIndex(index, points.length, WIDTH, PAD))} ${String(yForValue(value, height, PAD))}`;
    })
    .join(' ');
  const floor = height - PAD;
  const first = xForIndex(0, points.length, WIDTH, PAD);
  const last = xForIndex(points.length - 1, points.length, WIDTH, PAD);
  const area = points.length ? `${line} L ${String(last)} ${String(floor)} L ${String(first)} ${String(floor)} Z` : '';
  const lastValue = points[points.length - 1] ?? 0;

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${String(WIDTH)} ${String(height)}`}>
        <Path d={area} fill={colors.noteSoft} />
        <Path
          d={line}
          fill="none"
          stroke={colors.pinkAccent}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={last} cy={yForValue(lastValue, height, PAD)} r={5} fill={colors.pinkAccent} />
      </Svg>
      <View style={styles.labels}>
        <AppText variant="caption" color={colors.mute}>
          {startLabel}
        </AppText>
        <AppText variant="caption" color={colors.mute}>
          {endLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
