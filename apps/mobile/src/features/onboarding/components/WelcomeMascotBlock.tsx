import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/src/components/text/AppText';
import { DermisSheepSvg } from '@/src/components/mascot/DermisSheepSvg';
import { useMascotMotion } from '@/src/components/mascot/useMascotMotion';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, shadows } from '@/src/theme';

/** Prototype: sheep uses `bob 3.2s` (gentle lift + tilt). */
export function WelcomeMascotBlock() {
  const lines = getCopy().mascot.dermis.welcomeLines;
  const [index, setIndex] = useState(0);
  const message = lines[index % lines.length] ?? '';
  const { style } = useMascotMotion('bob');

  return (
    <>
      <View style={[styles.bubble, shadows.soft]}>
        <AppText style={styles.bubbleText}>{message}</AppText>
        <View style={styles.tail} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={getCopy().mascot.dermis.tapHint}
        accessibilityHint={message}
        onPress={() => setIndex((value) => (value + 1) % lines.length)}
        style={styles.sheepHit}
      >
        <Animated.View style={[styles.sheepMotion, style]}>
          <DermisSheepSvg size={158} mood="idle" />
        </Animated.View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    left: 18,
    top: 122,
    maxWidth: 168,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    zIndex: 4,
  },
  bubbleText: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  tail: {
    position: 'absolute',
    left: 44,
    bottom: -6,
    width: 14,
    height: 14,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  sheepHit: {
    position: 'absolute',
    left: 14,
    bottom: 20,
    width: 158,
    zIndex: 3,
  },
  /** Prototype transform-origin 50% 90%. */
  sheepMotion: {
    transformOrigin: '50% 90%',
  },
});
