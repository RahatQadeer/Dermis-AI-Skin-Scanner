import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Ellipse, Rect } from 'react-native-svg';

import { colors } from '@/src/theme';

/**
 * Prototype SUMMARY grass:
 * left/right -12%, top 240, height 120, border-radius 50% 50% 0 0,
 * clip-path inset(0 0 30px 0) → visible 90px elliptical hill.
 */
export function SummaryHill() {
  const { width: screenW } = useWindowDimensions();
  const width = screenW * 1.24;
  const fullHeight = 120;
  const visibleHeight = 90;
  const ry = fullHeight / 2;
  const cx = width / 2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.clip,
        {
          left: -screenW * 0.12,
          width,
          height: visibleHeight,
        },
      ]}
    >
      <Svg width={width} height={fullHeight}>
        <Ellipse cx={cx} cy={ry} rx={cx} ry={ry} fill={colors.hill} />
        <Rect x={0} y={ry} width={width} height={ry} fill={colors.hill} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    top: 240,
    overflow: 'hidden',
    zIndex: 1,
  },
});
