import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

/** Dim overlay + spinner while post-capture quality / identity checks run. */
export function ScanCheckingOverlay({ visible }: { visible: boolean }) {
  const c = getCopy().screens.camera;
  if (!visible) return null;

  return (
    <View
      style={styles.host}
      pointerEvents="auto"
      accessibilityRole="progressbar"
      accessibilityLabel={c.checkingA11y}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.card}>
        <ActivityIndicator color={colors.pinkBright} size="large" />
        <AppText variant="bodyStrong" color={colors.surface} align="center">
          {c.capturing}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 24, 18, 0.55)',
    paddingHorizontal: spacing.lg,
  },
  card: {
    minWidth: 180,
    maxWidth: 280,
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(47, 58, 44, 0.88)',
  },
});
