import { Pressable, StyleSheet, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors, radii } from '@/src/theme';

export type ScanShutterButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  ready?: boolean;
};

export function ScanShutterButton({
  onPress,
  disabled = false,
  ready = false,
}: ScanShutterButtonProps) {
  const c = getCopy().screens.camera;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ready ? c.shutterA11y : c.shutterNeedReadyA11y}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.outer,
        ready ? styles.ready : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <View style={[styles.inner, ready ? styles.innerReady : null]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    borderWidth: 4,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ready: {
    borderColor: colors.green,
  },
  inner: {
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    backgroundColor: colors.pink,
  },
  innerReady: {
    backgroundColor: colors.green,
  },
  pressed: {
    opacity: 0.7,
  },
});
