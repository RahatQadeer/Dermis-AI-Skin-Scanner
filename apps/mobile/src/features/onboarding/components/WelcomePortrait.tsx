import { Image, StyleSheet, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors, shadows } from '@/src/theme';

import { WelcomeScanDot } from './WelcomeScanDot';
import { WelcomeScanOverlay } from './WelcomeScanOverlay';
import { WelcomeScoreChip } from './WelcomeScoreChip';

const PORTRAIT = require('../../../../assets/images/welcome-portrait.jpg');

const FRAME_W = 184;
const FRAME_H = 236;
const BORDER = 5;
const TOP_R = FRAME_W / 2;
const BOTTOM_R = 0;
const INNER_W = FRAME_W - BORDER * 2;
const INNER_H = FRAME_H - BORDER * 2;
const INNER_TOP_R = Math.max(0, TOP_R - BORDER);
const INNER_BOTTOM_R = Math.max(0, BOTTOM_R - BORDER);

/** Prototype portrait arch: white shell, scanline, pulsing landmarks, score chips. */
export function WelcomePortrait() {
  const w = getCopy().screens.welcome;

  return (
    <>
      <View style={[styles.shell, shadows.card]}>
        <View style={styles.inner}>
          <Image
            source={PORTRAIT}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={w.portraitA11y}
          />
          <WelcomeScanOverlay frameHeight={INNER_H} />
          <WelcomeScanDot left="34%" top="40%" delayMs={0} />
          <WelcomeScanDot left="66%" top="40%" delayMs={500} />
          <WelcomeScanDot left="50%" top="56%" delayMs={1000} />
          <WelcomeScanDot left="50%" top="72%" delayMs={1500} />
        </View>
      </View>
      <WelcomeScoreChip
        score={w.chipHydrationScore}
        label={w.chipHydrationLabel}
        tone="green"
        style={styles.chipHydration}
      />
      <WelcomeScoreChip
        score={w.chipPoresScore}
        label={w.chipPoresLabel}
        tone="amber"
        delayMs={1400}
        style={styles.chipPores}
      />
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    right: 22,
    top: 112,
    width: FRAME_W,
    height: FRAME_H,
    padding: BORDER,
    backgroundColor: colors.surface,
    borderTopLeftRadius: TOP_R,
    borderTopRightRadius: TOP_R,
    borderBottomLeftRadius: BOTTOM_R,
    borderBottomRightRadius: BOTTOM_R,
    overflow: 'hidden',
    zIndex: 2,
  },
  inner: {
    width: INNER_W,
    height: INNER_H,
    overflow: 'hidden',
    borderTopLeftRadius: INNER_TOP_R,
    borderTopRightRadius: INNER_TOP_R,
    borderBottomLeftRadius: INNER_BOTTOM_R,
    borderBottomRightRadius: INNER_BOTTOM_R,
    backgroundColor: colors.hill,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: INNER_TOP_R,
    borderTopRightRadius: INNER_TOP_R,
    borderBottomLeftRadius: INNER_BOTTOM_R,
    borderBottomRightRadius: INNER_BOTTOM_R,
  },
  chipHydration: {
    right: 8,
    top: 112 + FRAME_H - 28,
  },
  chipPores: {
    right: 132,
    top: 370,
  },
});
