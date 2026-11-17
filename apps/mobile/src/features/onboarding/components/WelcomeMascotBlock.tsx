import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/src/components/text/AppText';
import { DermisSheepSvg } from '@/src/components/mascot/DermisSheepSvg';
import { MASCOT_WALK_ON_TAP_MS } from '@/src/components/mascot/mascotTypes';
import { useMascotMotion } from '@/src/components/mascot/useMascotMotion';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, shadows } from '@/src/theme';

/** Prototype: idle bob; tap cycles tip lines and briefly walks. */
export function WelcomeMascotBlock() {
  const lines = getCopy().mascot.dermis.welcomeLines;
  const [index, setIndex] = useState(0);
  const [walking, setWalking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const message = lines[index % lines.length] ?? '';
  const { style } = useMascotMotion(walking ? 'walk' : 'bob');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onPress = () => {
    setIndex((value) => (value + 1) % lines.length);
    if (timerRef.current) clearTimeout(timerRef.current);
    setWalking(true);
    timerRef.current = setTimeout(() => {
      setWalking(false);
      timerRef.current = null;
    }, MASCOT_WALK_ON_TAP_MS);
  };

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
        onPress={onPress}
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
    top: 128,
    maxWidth: '78%',

    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    zIndex: 4,
  },
  bubbleText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.ink,
  },
  tail: {
    position: 'absolute',
    left: 36,
    bottom: -5,
    width: 10,
    height: 10,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
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
