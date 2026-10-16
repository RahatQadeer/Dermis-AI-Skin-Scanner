import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export function AiConsentBullets() {
  const s = getCopy().screens.scanConsent;
  const items = [s.bulletTransit, s.bulletGemini, s.bulletScores, s.bulletDelete] as const;
  return (
    <View style={styles.list}>
      {items.map((line) => (
        <AppText key={line} variant="body" color={colors.ink}>
          {`• ${line}`}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
