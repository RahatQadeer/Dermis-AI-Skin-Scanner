import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { hasLegalUrls, legalUrls } from '@/src/features/auth/lib/legalUrls';
import { openLegalUrl } from '@/src/features/profile/lib/openLegalUrl';
import { colors, spacing } from '@/src/theme';

import { paywallDark } from '../paywallDark';

export type PaywallLegalFooterProps = {
  onLegalUnavailable: () => void;
};

export function PaywallLegalFooter({ onLegalUnavailable }: PaywallLegalFooterProps) {
  const p = getCopy().paywall;
  const tappable = hasLegalUrls();

  const openOrWarn = async (url: string) => {
    const opened = await openLegalUrl(url);
    if (!opened) {
      onLegalUnavailable();
    }
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color={paywallDark.textMuted} align="center" style={styles.line}>
        {p.autoRenews}
      </AppText>
      <AppText variant="caption" color={paywallDark.textMuted} align="center" style={styles.line}>
        {p.renewWindow}
      </AppText>
      <AppText variant="caption" color={paywallDark.textMuted} align="center" style={styles.line}>
        {p.cancelHint}
      </AppText>
      <View style={styles.links}>
        {tappable ? (
          <>
            <LegalLink label={p.terms} onPress={() => void openOrWarn(legalUrls.terms)} />
            <AppText variant="caption" color={paywallDark.textMuted}>
              {p.and}
            </AppText>
            <LegalLink label={p.privacy} onPress={() => void openOrWarn(legalUrls.privacy)} />
          </>
        ) : (
          <AppText variant="caption" color={paywallDark.textMuted} align="center">
            {p.terms} {p.and} {p.privacy}
          </AppText>
        )}
      </View>
    </View>
  );
}

function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={onPress}>
      <AppText variant="caption" color={colors.pink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs + 2,
  },
  line: {
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
