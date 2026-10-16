import { StyleSheet, View } from 'react-native';

import { MascotFigure } from '@/src/components/mascot/MascotFigure';
import { WelcomeScanDot } from '@/src/features/onboarding/components/WelcomeScanDot';
import { WelcomeScanOverlay } from '@/src/features/onboarding/components/WelcomeScanOverlay';
import { colors, radii } from '@/src/theme';

const SIZE = 196;
const RING = 6;
const PAD = 5;
/** Inner circle height the scan wash travels across. */
const INNER = SIZE - RING * 2 - PAD * 2;

/** Circular Professor Puff portrait with the same pink scanner wash as Welcome. */
export function AnalysingPortrait() {
  return (
    <View style={styles.ring}>
      <View style={styles.inner}>
        <MascotFigure character="professorPuff" mood="surprised" size={132} />
        <WelcomeScanOverlay frameHeight={INNER} />
        <WelcomeScanDot left="34%" top="38%" delayMs={0} />
        <WelcomeScanDot left="66%" top="38%" delayMs={500} />
        <WelcomeScanDot left="50%" top="54%" delayMs={1000} />
        <WelcomeScanDot left="50%" top="70%" delayMs={1500} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: radii.pill,
    borderWidth: RING,
    borderColor: colors.pinkBright,
    padding: PAD,
    backgroundColor: colors.sheepOutline,
  },
  inner: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.hero,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
