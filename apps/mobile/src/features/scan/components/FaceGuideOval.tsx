import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/src/theme';

type FaceGuideOvalProps = {
  /** Green “locked” guide while the hold-still countdown runs. */
  locked?: boolean;
};

/** Full camera guide: corner brackets, dashed oval, scan line. */
export function FaceGuideOval({ locked = false }: FaceGuideOvalProps) {
  const accent = locked ? colors.green : colors.pinkBright;
  const ovalBorder = locked ? colors.green : colors.surface;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.bracket, styles.tl, { borderColor: accent }]} />
      <View style={[styles.bracket, styles.tr, { borderColor: accent }]} />
      <View style={[styles.bracket, styles.bl, { borderColor: accent }]} />
      <View style={[styles.bracket, styles.br, { borderColor: accent }]} />
      <View style={styles.center}>
        <View style={[styles.oval, { borderColor: ovalBorder }]}>
          <View style={[styles.scanLine, { backgroundColor: accent }]} />
        </View>
      </View>
    </View>
  );
}

const BRACKET = 40;

const styles = StyleSheet.create({
  bracket: {
    position: 'absolute',
    width: BRACKET,
    height: BRACKET,
  },
  tl: { top: spacing.lg, left: spacing.lg, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radii.md },
  tr: { top: spacing.lg, right: spacing.lg, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radii.md },
  bl: { bottom: spacing.lg, left: spacing.lg, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radii.md },
  br: { bottom: spacing.lg, right: spacing.lg, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radii.md },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    width: 230,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  scanLine: {
    height: 2,
    marginHorizontal: spacing.xl,
  },
});
