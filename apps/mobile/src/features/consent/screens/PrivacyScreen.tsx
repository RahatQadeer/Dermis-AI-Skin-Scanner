import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { legalUrls } from '@/src/features/auth/lib/legalUrls';
import { openLegalUrl } from '@/src/features/auth/lib/openLegalUrl';
import { colors, spacing } from '@/src/theme';

export function PrivacyScreen() {
  const router = useRouter();
  const p = getCopy().screens.privacy;
  const [toast, setToast] = useState('');

  const openUrl = useCallback(
    async (url: string) => {
      const opened = await openLegalUrl(url);
      if (!opened) {
        setToast(p.missingUrl);
      }
    },
    [p.missingUrl],
  );

  return (
    <Screen scroll padded edges={['top', 'left', 'right', 'bottom']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <Header
        title={p.title}
        onBack={router.canGoBack() ? () => router.back() : () => router.replace('/home')}
      />
      <AppText variant="headline">{p.headline}</AppText>
      <AppText variant="body" color={colors.ink}>
        {p.body}
      </AppText>
      <View style={styles.list}>
        <AppText variant="body">{`• ${p.bulletCloud}`}</AppText>
        <AppText variant="body">{`• ${p.bulletKeys}`}</AppText>
        <AppText variant="body">{`• ${p.bulletControl}`}</AppText>
      </View>
      <AppText variant="caption" color={colors.mute}>
        {p.retentionNote}
      </AppText>
      <AppText variant="caption" color={colors.mute}>
        {p.notMedical}
      </AppText>
      <View style={styles.actions}>
        <Button label={p.openPolicy} onPress={() => void openUrl(legalUrls.privacy)} />
        <Button
          label={p.openTerms}
          variant="secondary"
          onPress={() => void openUrl(legalUrls.terms)}
        />
      </View>
      <ToastHost message={toast} visible={Boolean(toast)} onDismiss={() => setToast('')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  list: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
