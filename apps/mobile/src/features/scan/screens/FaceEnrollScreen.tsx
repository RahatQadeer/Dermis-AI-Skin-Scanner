import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/src/components/IconButton';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, motion, spacing } from '@/src/theme';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { CameraStage } from '../components/CameraStage';
import { ScanShutterButton } from '../components/ScanShutterButton';
import { useCameraCaptureControls } from '../hooks/useCameraCaptureControls';
import { useFaceEnrollCapture } from '../hooks/useFaceEnrollCapture';
import { preloadFaceEmbedder } from '../lib/faceEmbedder';

/** One-time face registration before identity-gated analysis scans. */
export function FaceEnrollScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ replace?: string }>();
  const replace = params.replace === '1' || params.replace === 'true';
  const cameraRef = useRef<CameraPreviewLiveHandle | null>(null);
  const controls = useCameraCaptureControls(cameraRef);
  const enroll = useFaceEnrollCapture(cameraRef, controls, replace);
  const copy = getCopy().screens.faceEnroll;
  useEffect(() => {
    void preloadFaceEmbedder();
  }, []);

  return (
    <Screen
      padded
      edges={['top', 'left', 'right', 'bottom']}
      style={styles.screen}
      contentStyle={styles.content}
    >
      <StatusBar style="light" />
      <EnrollHeader
        title={copy.title}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
      />
      <AppText variant="body" color={colors.surface} align="center">
        {copy.body}
      </AppText>
      <EnrollCamera controls={controls} cameraRef={cameraRef} saving={enroll.saving} />
      <EnrollShutter copy={copy} controls={controls} enroll={enroll} />
      <ToastHost
        message={enroll.toast ?? ''}
        visible={Boolean(enroll.toast)}
        onDismiss={enroll.clearToast}
        durationMs={motion.duration.toastImportant}
        celebrate={false}
      />
    </Screen>
  );
}

function EnrollCamera({
  controls,
  cameraRef,
  saving,
}: {
  controls: ReturnType<typeof useCameraCaptureControls>;
  cameraRef: RefObject<CameraPreviewLiveHandle | null>;
  saving: boolean;
}) {
  return (
    <CameraStage
      capture={controls.capture}
      cameraRef={cameraRef}
      flashing={saving}
      afterFlash={() => undefined}
      faceLocked={controls.liveQuality.ready}
      countdownSeconds={null}
    />
  );
}

function EnrollShutter({
  copy,
  controls,
  enroll,
}: {
  copy: ReturnType<typeof getCopy>['screens']['faceEnroll'];
  controls: ReturnType<typeof useCameraCaptureControls>;
  enroll: ReturnType<typeof useFaceEnrollCapture>;
}) {
  return (
    <View style={styles.bottom}>
      <AppText variant="bodyStrong" color={colors.surface} align="center">
        {controls.liveQuality.ready ? copy.readyPrompt : copy.framePrompt}
      </AppText>
      <ScanShutterButton
        onPress={() => void enroll.enroll()}
        disabled={enroll.saving || controls.busy}
        ready={controls.liveQuality.ready}
      />
    </View>
  );
}

function EnrollHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <IconButton accessibilityLabel={getCopy().nav.backA11y} onPress={onBack} size={44}>
        <AppText variant="headline" color={colors.ink}>
          {getCopy().nav.backGlyph}
        </AppText>
      </IconButton>
      <AppText variant="label" color={colors.surface} align="center" style={styles.headerLabel}>
        {title}
      </AppText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    flex: 1,
  },
  headerSpacer: {
    width: 44,
  },
  bottom: {
    gap: spacing.md,
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
});
