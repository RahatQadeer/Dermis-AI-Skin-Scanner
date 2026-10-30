import { Linking, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

type Props = {
  /** iOS/Android stop showing the system prompt after a hard denial. */
  canAskAgain: boolean;
  onRequest: () => void;
};

/** Shown over the camera stage when access was denied, with a way forward. */
export function CameraPermissionCard({ canAskAgain, onRequest }: Props) {
  const c = getCopy().screens.camera;
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <AppText variant="headline" color={colors.ink} align="center">
          {c.permissionTitle}
        </AppText>
        <AppText variant="body" color={colors.muteBody} align="center">
          {canAskAgain ? c.permissionDenied : c.permissionDeniedSettings}
        </AppText>
        <Button
          label={canAskAgain ? c.grantPermission : c.openSettings}
          onPress={canAskAgain ? onRequest : () => void Linking.openSettings()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    gap: spacing.md,
  },
});
