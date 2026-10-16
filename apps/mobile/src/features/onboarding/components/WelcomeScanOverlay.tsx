import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useReduceMotion } from '@/src/lib/useReduceMotion';
import { colors } from '@/src/theme';

const SCAN_BAND_H = 56;
/** Prototype `scanline 3.4s` full top↔bottom cycle. */
const SCAN_CYCLE_MS = 3400;

export type WelcomeScanOverlayProps = {
  frameHeight: number;
};

/**
 * Prototype scan wash: `linear-gradient(transparent → pink .35)` + 2.5px edge.
 * SVG gradient keeps the shadow smooth (no hard band steps).
 */
export function WelcomeScanOverlay({ frameHeight }: WelcomeScanOverlayProps) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(frameHeight * 0.08);

  useEffect(() => {
    const start = frameHeight * 0.08;
    const end = frameHeight * 0.88;
    translateY.value = start;
    if (reduceMotion) {
      translateY.value = frameHeight * 0.35;
      return;
    }
    const half = SCAN_CYCLE_MS / 2;
    translateY.value = withRepeat(
      withSequence(
        withTiming(end, { duration: half, easing: Easing.inOut(Easing.ease) }),
        withTiming(start, { duration: half, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [frameHeight, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - SCAN_BAND_H }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.band, style]} accessibilityElementsHidden>
      <Svg width="100%" height={SCAN_BAND_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="welcomeScanWash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.pinkBright} stopOpacity="0" />
            <Stop offset="0.55" stopColor={colors.pinkBright} stopOpacity="0.18" />
            <Stop offset="1" stopColor={colors.pinkBright} stopOpacity="0.38" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={SCAN_BAND_H} fill="url(#welcomeScanWash)" />
      </Svg>
      <View style={styles.line} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCAN_BAND_H,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2.5,
    backgroundColor: colors.pinkBright,
  },
});
