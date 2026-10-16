import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { HealthDisclaimer } from '@/src/components/HealthDisclaimer';
import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { AiConsentBullets } from '../components/AiConsentBullets';
import { useAiConsentActions } from '../hooks/useAiConsentActions';

export function AiConsentScreen() {
  const s = getCopy().screens.scanConsent;
  const flow = useAiConsentActions();

  return (
    <Screen scroll padded edges={['top', 'left', 'right', 'bottom']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <Header title={s.title} onBack={flow.onDecline} />
      <Mascot mood="think" size={72} lines={[s.headline]} showBubble />
      <AppText variant="body" color={colors.ink}>
        {s.body}
      </AppText>
      <AiConsentBullets />
      <AppText variant="caption" color={colors.mute}>
        {s.retention}
      </AppText>
      <Button label={s.privacyLink} variant="ghost" onPress={flow.openPrivacy} />
      <View style={styles.actions}>
        <Button
          label={s.allow}
          size="lg"
          onPress={() => void flow.onAllow()}
          disabled={flow.busy}
        />
        <Button
          label={s.notNow}
          variant="secondary"
          onPress={flow.onDecline}
          disabled={flow.busy}
        />
      </View>
      <HealthDisclaimer />
      <ToastHost
        message={flow.error ?? ''}
        visible={Boolean(flow.error)}
        onDismiss={flow.dismissError}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
