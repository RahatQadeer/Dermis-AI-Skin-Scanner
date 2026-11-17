import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { isFaceIdentityEnabled } from '@/src/features/scan/lib/faceConfig';
import { resolveFaceEnrolled } from '@/src/features/scan/lib/faceEnrollmentStatus';
import { useSession } from '@/src/features/session/SessionContext';
import { colors, radii, spacing } from '@/src/theme';

const SETUP_HREF = '/(scan)/face-setup' as Href;

/** One-time popup for new accounts that still need a selfie registration. */
export function FaceRegisterPrompt() {
  const router = useRouter();
  const { userId, apiEnabled, accessToken } = useSession();
  const c = getCopy().screens.faceEnroll;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isFaceIdentityEnabled() || !apiEnabled || !accessToken || !userId) {
      setOpen(false);
      return;
    }
    let cancelled = false;
    void resolveFaceEnrolled(userId).then((enrolled) => {
      if (!cancelled) setOpen(!enrolled);
    });
    return () => {
      cancelled = true;
    };
  }, [apiEnabled, accessToken, userId]);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText variant="headline" color={colors.ink} align="center">
            {c.introTitle}
          </AppText>
          <AppText variant="body" color={colors.muteBody} align="center">
            {c.introBody}
          </AppText>
          <AppText variant="caption" color={colors.mute} align="center">
            {c.introPrivacy}
          </AppText>
          <Button
            label={c.introCta}
            onPress={() => {
              setOpen(false);
              router.push(SETUP_HREF);
            }}
          />
          <Button label={c.introLater} variant="outline" onPress={() => setOpen(false)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
});
