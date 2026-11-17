import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, motion, spacing } from '@/src/theme';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { SelfiePreview } from '../components/SelfiePreview';
import { useFaceSelfieRegister } from '../hooks/useFaceSelfieRegister';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import type { FaceEnrollMode } from '../lib/verifyFaceIdentity';

const CAMERA_HREF = '/(scan)/camera' as Href;

function resolveEnrollMode(params: { replace?: string; addFace?: string }): FaceEnrollMode {
  if (params.addFace === '1' || params.addFace === 'true') return 'addFace';
  if (params.replace === '1' || params.replace === 'true') return 'replace';
  return 'enroll';
}

/** One-time selfie registration — visually separate from the analysis scanner. */
export function FaceEnrollScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ replace?: string; addFace?: string }>();
  const mode = resolveEnrollMode(params);
  const cameraRef = useRef<CameraPreviewLiveHandle | null>(null);
  const enroll = useFaceSelfieRegister(cameraRef, mode);

  if (enroll.done) {
    return <FaceRegisterSuccess mode={mode} />;
  }

  return (
    <FaceSelfieForm
      cameraRef={cameraRef}
      enroll={enroll}
      onBack={() => {
        // Exit the scan funnel cleanly (same as camera Back).
        router.replace('/(tabs)/home');
      }}
    />
  );
}

function FaceSelfieForm({
  cameraRef,
  enroll,
  onBack,
}: {
  cameraRef: RefObject<CameraPreviewLiveHandle | null>;
  enroll: ReturnType<typeof useFaceSelfieRegister>;
  onBack: () => void;
}) {
  const copy = getCopy().screens.faceEnroll;
  return (
    <Screen
      scroll
      padded
      edges={['top', 'left', 'right', 'bottom']}
      style={styles.cream}
      contentStyle={styles.content}
    >
      <StatusBar style="dark" />
      <SelfieHeader title={copy.title} onBack={onBack} />
      <AppText variant="body" color={colors.muteBody} align="center">
        {copy.body}
      </AppText>
      <SelfiePreview
        ref={cameraRef}
        active={enroll.permissionGranted}
        ready={enroll.framingReady && !enroll.saving}
      />
      <AppText variant="caption" color={colors.mute} align="center">
        {copy.privacyFooter}
      </AppText>
      <AppText variant="bodyStrong" color={colors.ink} align="center">
        {enrollPrompt(copy, enroll)}
      </AppText>
      <Button
        label={copy.shutterLabel}
        loading={enroll.saving}
        disabled={!enroll.permissionGranted || enroll.saving}
        onPress={() => void enroll.register()}
      />
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

function FaceRegisterSuccess({ mode }: { mode: FaceEnrollMode }) {
  const router = useRouter();
  const copy = getCopy().screens.faceEnroll;
  const fromProfile = mode === 'replace' || mode === 'addFace';
  const title = mode === 'addFace' ? copy.addFaceSuccessTitle : copy.successTitle;
  const body = mode === 'addFace' ? copy.addFaceSuccessBody : copy.successBody;
  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']} style={styles.cream}>
      <StatusBar style="dark" />
      <View style={styles.success}>
        <AppText variant="display" color={colors.ink} align="center">
          {title}
        </AppText>
        <AppText variant="body" color={colors.muteBody} align="center">
          {body}
        </AppText>
        <Button
          label={fromProfile ? copy.successHome : copy.successCta}
          onPress={() => router.replace(fromProfile ? '/(tabs)/profile' : CAMERA_HREF)}
        />
        {fromProfile ? null : (
          <Button
            label={copy.successHome}
            variant="outline"
            onPress={() => router.replace('/(tabs)/home')}
          />
        )}
      </View>
    </Screen>
  );
}

function enrollPrompt(
  copy: ReturnType<typeof getCopy>['screens']['faceEnroll'],
  enroll: ReturnType<typeof useFaceSelfieRegister>,
): string {
  if (enroll.saving) return copy.savingPrompt;
  if (!enroll.permissionGranted) return copy.framePrompt;
  if (enroll.liveIssue) return messageForLiveIssue(enroll.liveIssue);
  if (!enroll.framingReady) return copy.holdPrompt;
  return copy.readyPrompt;
}

function SelfieHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <IconButton accessibilityLabel={getCopy().nav.backA11y} onPress={onBack} size={44}>
        <AppText variant="headline" color={colors.ink}>
          {getCopy().nav.backGlyph}
        </AppText>
      </IconButton>
      <AppText variant="headline" color={colors.ink} align="center" style={styles.headerLabel}>
        {title}
      </AppText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  cream: {
    backgroundColor: colors.cream,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
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
  success: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
