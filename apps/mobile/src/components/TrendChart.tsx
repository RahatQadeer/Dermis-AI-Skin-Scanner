import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { AppText } from '@/src/components/text/AppText';
import { clampScore } from '@/src/lib/clampScore';
import { buildPolyline, xForIndex, yForValue } from '@/src/lib/trendPolyline';
import { colors, spacing } from '@/src/theme';

export type TrendPoint = {
  label: string;
  value: number;
};

export type TrendChartProps = {
  points: readonly TrendPoint[];
  height?: number;
  title?: string;
};

export function TrendChart({ points, height = 120, title }: TrendChartProps) {
  const width = 280;
  const pad = 12;
  const values = points.map((point) => clampScore(point.value));
  const path = buildPolyline(values, width, height, pad);

  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel={title ?? 'Trend chart'}>
      {title ? (
        <AppText variant="bodyStrong" style={styles.title}>
          {title}
        </AppText>
      ) : null}
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polyline
          points={path}
          fill="none"
          stroke={colors.green}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((value, index) => {
          const x = xForIndex(index, values.length, width, pad);
          const y = yForValue(value, height, pad);
          return (
            <Circle key={points[index]?.label ?? index} cx={x} cy={y} r={4} fill={colors.pink} />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {points.map((point) => (
          <AppText key={point.label} variant="caption" color={colors.mute}>
            {point.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

export { buildPolyline } from '@/src/lib/trendPolyline';

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
