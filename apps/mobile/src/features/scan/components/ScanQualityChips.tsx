import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

type ScanQualityChipsProps = {
  /** Hold-still countdown active — treat framing as ready. */
  frameReady?: boolean;
};

/** Framing-quality hints shown under the camera preview. */
export function ScanQualityChips({ frameReady = false }: ScanQualityChipsProps) {
  const c = getCopy().screens.camera;
  return (
    <View style={styles.row} accessibilityRole="summary">
      <QualityChip label={c.qualityLighting} ok={frameReady} />
      <QualityChip label={c.qualityDistance} ok={frameReady} />
      <QualityChip label={c.qualityHold} ok={frameReady} />
    </View>
  );
}

function QualityChip({ label, ok = false }: { label: string; ok?: boolean }) {
  return (
    <View style={[styles.chip, ok ? styles.ok : styles.neutral]}>
      <AppText variant="caption" color={colors.surface}>
        {ok ? `✓ ${label}` : label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  ok: {
    backgroundColor: colors.green,
  },
  neutral: {
    backgroundColor: colors.mute,
  },
});
