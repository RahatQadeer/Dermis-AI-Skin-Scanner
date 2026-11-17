import { type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import { useScanCaptureFlow } from '../hooks/useScanCaptureFlow';
import { CameraPermissionCard } from './CameraPermissionCard';
import { CameraPreviewLive, type CameraPreviewLiveHandle } from './CameraPreviewLive';
import { CameraPreviewMock } from './CameraPreviewMock';
import { ScanCheckingOverlay } from './ScanCheckingOverlay';

type Props = {
  capture: ReturnType<typeof useScanCaptureFlow>;
  cameraRef: RefObject<CameraPreviewLiveHandle | null>;
  flashing?: boolean;
  afterFlash?: () => void;
  faceLocked?: boolean;
  countdownSeconds?: number | null;
};

export function CameraStage({
  capture,
  cameraRef,
  faceLocked = false,
  countdownSeconds = null,
}: Props) {
  const showLive = capture.liveCamera && capture.permissionGranted;
  const c = getCopy().screens.camera;
  return (
    <View style={styles.stage}>
      {showLive ? (
        <CameraPreviewLive ref={cameraRef} active faceLocked={faceLocked} />
      ) : (
        <CameraPreviewMock />
      )}
      {countdownSeconds !== null && countdownSeconds > 0 && !capture.capturing ? (
        <View style={styles.countdown} accessibilityLabel={c.countdownA11y(countdownSeconds)}>
          <View style={styles.countdownBadge}>
            <AppText variant="display" color={colors.surface}>
              {String(countdownSeconds)}
            </AppText>
          </View>
        </View>
      ) : null}
      <ScanCheckingOverlay visible={capture.capturing} />
      {capture.permissionDenied ? (
        <CameraPermissionCard
          canAskAgain={capture.canAskCameraAgain}
          onRequest={() => void capture.requestCamera()}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    position: 'relative',
  },
  countdown: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingBottom: spacing.xl,
  },
  countdownBadge: {
    minWidth: 72,
    minHeight: 72,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 58, 44, 0.55)',
    paddingHorizontal: spacing.md,
  },
});
