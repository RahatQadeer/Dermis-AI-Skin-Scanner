import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

export function ResultsShareButton(props: { busy: boolean; onPress: () => void }) {
  const r = getCopy().screens.results;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={r.shareCta}
      onPress={props.onPress}
      disabled={props.busy}
      style={({ pressed }) => [styles.share, pressed && styles.sharePressed]}
    >
      <AppText variant="caption" color={colors.ink} style={styles.shareLabel} numberOfLines={1}>
        {r.shareCta}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  share: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    flexShrink: 0,
  },
  sharePressed: { opacity: 0.85 },
  shareLabel: { fontFamily: fontFamilies.bodySemiBold, flexShrink: 0 },
});
