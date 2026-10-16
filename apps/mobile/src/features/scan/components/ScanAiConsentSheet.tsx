import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/layout/Sheet';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { AiConsentBullets } from '@/src/features/consent/components/AiConsentBullets';
import { colors, spacing } from '@/src/theme';

export type ScanAiConsentSheetProps = {
  visible: boolean;
  busy: boolean;
  onAllow: () => void;
  onDecline: () => void;
};

/** Fallback when API returns consent_required mid-upload; primary gate is AiConsentScreen. */
export function ScanAiConsentSheet({ visible, busy, onAllow, onDecline }: ScanAiConsentSheetProps) {
  const s = getCopy().screens.scanConsent;

  return (
    <Sheet visible={visible} onClose={onDecline} title={s.title} dismissOnOverlay={false}>
      <View style={styles.body}>
        <AppText variant="body" color={colors.ink}>
          {s.body}
        </AppText>
        <AiConsentBullets />
        <AppText variant="caption" color={colors.mute}>
          {s.retention}
        </AppText>
        <Button label={s.allow} onPress={onAllow} disabled={busy} />
        <Button label={s.notNow} variant="secondary" onPress={onDecline} disabled={busy} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
});
