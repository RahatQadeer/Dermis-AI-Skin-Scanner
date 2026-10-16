import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/src/components/IconButton';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { Mascot } from '@/src/components/mascot/Mascot';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { CameraStage } from '../components/CameraStage';
import { ScanQualityChips } from '../components/ScanQualityChips';
import { ScanShutterButton } from '../components/ScanShutterButton';
import { useCameraScreenState } from '../hooks/useCameraScreenState';

export function CameraScreen() {
  const c = getCopy().screens.camera;
  const state = useCameraScreenState();
  const onBack = state.router.canGoBack()
    ? () => state.router.back()
    : () => state.router.replace('/(tabs)/home');
  const prompt = state.countdown.active
    ? state.countdown.secondsLeft === 1
      ? c.faceLocked
      : c.faceGetReady
    : c.faceInOval;

  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']} style={styles.screen} contentStyle={styles.content}>
      <StatusBar style="light" />
      <CameraHeader label={c.frontViewLabel} onBack={onBack} />
      <CameraStage
        capture={state.capture}
        cameraRef={state.cameraRef}
        flashing={state.flashing || state.capture.capturing}
        afterFlash={state.afterFlash}
        faceLocked={state.countdown.frameReady}
        countdownSeconds={state.countdown.secondsLeft}
      />
      <ScanQualityChips frameReady={state.countdown.frameReady} />
      <CameraBottomBar prompt={prompt} onShutter={state.shutter} busy={state.busy} />
      <ToastHost
        message={state.errorToast ?? ''}
        visible={Boolean(state.errorToast)}
        onDismiss={state.clearError}
      />
    </Screen>
  );
}

function CameraHeader({ label, onBack }: { label: string; onBack: () => void }) {
  const nav = getCopy().nav;
  return (
    <View style={styles.header}>
      <IconButton accessibilityLabel={nav.backA11y} onPress={onBack} size={44}>
        <AppText variant="headline" color={colors.ink}>
          {nav.backGlyph}
        </AppText>
      </IconButton>
      <AppText variant="label" color={colors.surface} align="center" style={styles.headerLabel}>
        {label.toUpperCase()}
      </AppText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function CameraBottomBar({
  prompt,
  onShutter,
  busy,
}: {
  prompt: string;
  onShutter: () => void;
  busy: boolean;
}) {
  return (
    <View style={styles.bottom}>
      <View style={styles.mascot}>
        <Mascot mood="happy" size={48} showBubble={false} />
        <View style={styles.bubble}>
          <SpeechBubble message={prompt} tail="left" compact />
        </View>
      </View>
      <ScanShutterButton onPress={onShutter} disabled={busy} />
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
    gap: spacing.sm,
    minHeight: 48,
  },
  headerLabel: {
    flex: 1,
  },
  headerSpacer: {
    width: 44,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  mascot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bubble: {
    flex: 1,
  },
});
