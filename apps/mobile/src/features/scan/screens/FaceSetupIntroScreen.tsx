import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Screen } from '@/src/components/layout/Screen';
import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import { useFaceSetupCheck } from './useFaceSetupCheck';

/** First-time enroll only — never `replace=1` (that is Profile → Update face). */
const SELFIE_HREF = '/(scan)/face-enroll' as Href;

/** Clear “register your face” step — not the analysis scanner. */
export function FaceSetupIntroScreen() {
  const router = useRouter();
  const c = getCopy().screens.faceEnroll;
  const checking = useFaceSetupCheck();

  if (checking) {
    return (
      <Screen padded edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.pink} />
      </Screen>
    );
  }

  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Mascot
          mood="happy"
          size={72}
          lines={getCopy().mascot.dermis.tipLines}
          revealOnTap
          compactBubble
        />
        <AppText variant="display" color={colors.ink} align="center">
          {c.introTitle}
        </AppText>
        <AppText variant="body" color={colors.muteBody} align="center">
          {c.introBody}
        </AppText>
        <View style={styles.privacy}>
          <AppText variant="caption" color={colors.mute} align="center">
            {c.introPrivacy}
          </AppText>
        </View>
        <Button label={c.introCta} onPress={() => router.replace(SELFIE_HREF)} />
        <Button
          label={c.introLater}
          variant="outline"
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  privacy: {
    backgroundColor: colors.noteSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    width: '100%',
  },
});
