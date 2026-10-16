import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { hasLegalUrls, legalUrls } from '@/src/features/auth/lib/legalUrls';
import { colors, spacing } from '@/src/theme';

import { openLegalUrl } from '../lib/openLegalUrl';

export function ProfileAboutSection({ onLegalUnavailable }: { onLegalUnavailable: () => void }) {
  const p = getCopy().screens.profile;
  const compliance = getCopy().compliance;
  const tappable = hasLegalUrls();

  const openOrWarn = async (url: string) => {
    const opened = await openLegalUrl(url);
    if (!opened) {
      onLegalUnavailable();
    }
  };

  return (
    <View style={styles.about}>
      <AppText variant="bodyStrong" color={colors.ink}>
        {p.aboutTitle}
      </AppText>
      <AppText variant="caption" color={colors.mute} style={styles.aboutBody}>
        {compliance.healthDeclaration}
      </AppText>
      <View style={styles.legalLinks}>
        {tappable ? (
          <>
            <LegalLink label={p.privacyPolicy} onPress={() => void openOrWarn(legalUrls.privacy)} />
            <AppText variant="caption" color={colors.muteFoot}>
              ·
            </AppText>
            <LegalLink label={p.terms} onPress={() => void openOrWarn(legalUrls.terms)} />
          </>
        ) : (
          <AppText variant="caption" color={colors.muteFoot} style={styles.aboutBody}>
            {p.legalUnavailable}
          </AppText>
        )}
      </View>
    </View>
  );
}

function LegalLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={onPress} hitSlop={8}>
      <AppText variant="caption" color={colors.ink} style={styles.link}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  about: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  aboutBody: {
    textAlign: 'left',
    lineHeight: 20,
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
