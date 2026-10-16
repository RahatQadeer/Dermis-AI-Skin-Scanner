import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii } from '@/src/theme';

export type SummaryFooterProps = {
  bottomInset: number;
  onScan: () => void;
  onSkip: () => void;
};

export function SummaryFooter({ bottomInset, onScan, onSkip }: SummaryFooterProps) {
  const summary = getCopy().screens.summary;

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 12) + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${summary.ctaScan} ${summary.ctaArrow}`}
        onPress={onScan}
        style={styles.cta}
      >
        <AppText style={styles.ctaLabel} color={colors.surface}>
          {summary.ctaScan}
        </AppText>
        <AppText style={styles.ctaArrow} color={colors.surface}>
          {summary.ctaArrow}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={summary.skipHome}
        onPress={onSkip}
        style={styles.skip}
      >
        <AppText style={styles.skipLabel} color={colors.muteSoft}>
          {summary.skipHome}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: 6,
  },
  cta: {
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 16,
    lineHeight: 22,
  },
  ctaArrow: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 22,
  },
  skip: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 14,
    lineHeight: 20,
  },
});
