import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

/** Thin marker between face series in Progress history. */
export function ProgressNewFaceDivider() {
  const p = getCopy().screens.progress;
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <View style={styles.line} />
      <View style={styles.label}>
        <AppText variant="caption" color={colors.ink} align="center">
          {p.newFaceMarker}
        </AppText>
        <AppText variant="caption" color={colors.muteFoot} align="center">
          {p.newFaceHint}
        </AppText>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.rowDivider,
  },
  label: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
});
