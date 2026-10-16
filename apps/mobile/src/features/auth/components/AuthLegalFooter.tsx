import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { hasLegalUrls, legalUrls } from '../lib/legalUrls';
import { openLegalUrl } from '../lib/openLegalUrl';

/** Legal agreement line — links as siblings (not nested in Text) for SR. */
export function AuthLegalFooter() {
  const auth = getCopy().auth;
  const tappable = hasLegalUrls();

  return (
    <View style={styles.wrap} accessibilityRole="text">
      <AppText variant="caption" color={colors.mute} align="center">
        {auth.legalLead}
      </AppText>
      <View style={styles.links}>
        {tappable ? (
          <>
            <LegalLink label={auth.termsLink} url={legalUrls.terms} />
            <AppText variant="caption" color={colors.mute}>
              {auth.and}
            </AppText>
            <LegalLink label={auth.privacyLink} url={legalUrls.privacy} />
          </>
        ) : (
          <AppText variant="caption" color={colors.mute} align="center">
            {auth.termsLink} {auth.and} {auth.privacyLink}.
          </AppText>
        )}
      </View>
    </View>
  );
}

function LegalLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => void openLegalUrl(url)}
    >
      <AppText variant="caption" color={colors.pink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
