import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { IconButton } from '@/src/components/IconButton';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { Mascot } from '@/src/components/mascot/Mascot';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, motion, spacing } from '@/src/theme';

import { CameraStage } from '../components/CameraStage';
import { ScanQualityChips } from '../components/ScanQualityChips';
import { ScanShutterButton } from '../components/ScanShutterButton';
import { useCameraScreenState } from '../hooks/useCameraScreenState';
import { isFaceIdentityEnabled } from '../lib/faceConfig';
import { preloadFaceEmbedder } from '../lib/faceEmbedder';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';

export function CameraScreen() {
  const c = getCopy().screens.camera;
  const state = useCameraScreenState();
  useEffect(() => {
    if (isFaceIdentityEnabled()) void preloadFaceEmbedder();
  }, []);

  const prompt = cameraPrompt(c, state);

  return (
    <Screen
      padded
      edges={['top', 'left', 'right', 'bottom']}
      style={styles.screen}
      contentStyle={styles.content}
    >
      <StatusBar style="light" />
      <CameraHeader label={c.frontViewLabel} onBack={state.goBack} />
      {state.cameraAllowed ? (
        <CameraStage
          capture={state.capture}
          cameraRef={state.cameraRef}
          faceLocked={state.capture.capturing}
          countdownSeconds={0}
        />
      ) : (
        <View style={styles.gate} accessibilityLabel={c.liveDetectorLoading}>
          <ActivityIndicator color={colors.pinkBright} />
          <AppText variant="body" color={colors.surface} align="center">
            {c.liveDetectorLoading}
          </AppText>
        </View>
      )}
      <ScanQualityChips liveIssue={state.liveQuality.issue} ready={state.captureReady} />
      <CameraBottomBar
        prompt={prompt}
        onShutter={state.shutter}
        busy={state.busy}
        ready={state.captureReady}
      />
      <ToastHost
        message={state.errorToast ?? ''}
        visible={Boolean(state.errorToast)}
        onDismiss={state.clearError}
        durationMs={motion.duration.toastImportant}
        celebrate={false}
      />
    </Screen>
  );
}

function cameraPrompt(
  c: ReturnType<typeof getCopy>['screens']['camera'],
  state: ReturnType<typeof useCameraScreenState>,
): string {
  if (!state.cameraAllowed) return c.liveDetectorLoading;
  if (state.capture.capturing || state.statusMessage) {
    return state.statusMessage ?? c.capturing;
  }
  if (state.liveQuality.issue) return messageForLiveIssue(state.liveQuality.issue);
  if (state.captureReady) return c.statusReady;
  return c.tip;
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
  ready,
}: {
  prompt: string;
  onShutter: () => void;
  busy: boolean;
  ready: boolean;
}) {
  return (
    <View style={styles.bottom}>
      <View style={styles.mascot}>
        <Mascot mood="happy" size={48} showBubble={false} walkOnTap={false} />
        <View style={styles.bubble}>
          <SpeechBubble message={prompt} tail="left" />
        </View>
      </View>
      <ScanShutterButton onPress={onShutter} disabled={busy} ready={ready} />
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
  gate: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    zIndex: 5,
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
    overflow: 'visible',
    zIndex: 2,
  },
  bubble: {
    flex: 1,
  },
});
