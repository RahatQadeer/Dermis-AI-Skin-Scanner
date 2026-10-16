import { type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { useScanCaptureFlow } from '../hooks/useScanCaptureFlow';
import { CameraPreviewLive, type CameraPreviewLiveHandle } from './CameraPreviewLive';
import { CameraPreviewMock } from './CameraPreviewMock';
import { FlashOverlay } from './FlashOverlay';

type Props = {
  capture: ReturnType<typeof useScanCaptureFlow>;
  cameraRef: RefObject<CameraPreviewLiveHandle | null>;
  flashing: boolean;
  afterFlash: () => void;
  faceLocked?: boolean;
  countdownSeconds?: number | null;
};

export function CameraStage({
  capture,
  cameraRef,
  flashing,
  afterFlash,
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
      {countdownSeconds !== null && countdownSeconds > 0 ? (
        <View style={styles.countdown} accessibilityLabel={c.countdownA11y(countdownSeconds)}>
          <AppText variant="display" color={colors.surface}>
            {String(countdownSeconds)}
          </AppText>
        </View>
      ) : null}
      <FlashOverlay visible={flashing} onFinished={afterFlash} />
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
    backgroundColor: 'rgba(47, 58, 44, 0.35)',
    paddingBottom: spacing.xl,
  },
});
