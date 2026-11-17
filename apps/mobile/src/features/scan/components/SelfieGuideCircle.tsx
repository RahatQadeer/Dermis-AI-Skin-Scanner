import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/src/theme';

type Props = {
  ready?: boolean;
};

/** Soft circle for face registration selfie — not the analysis scanner oval. */
export function SelfieGuideCircle({ ready = false }: Props) {
  const border = ready ? colors.green : colors.pinkBright;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <View style={[styles.circle, { borderColor: border }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    backgroundColor: 'transparent',
    marginBottom: spacing.md,
  },
});
