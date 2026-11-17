import { CameraView } from 'expo-camera';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/src/theme';

import type { CameraPreviewLiveHandle } from './CameraPreviewLive';
import { SelfieGuideCircle } from './SelfieGuideCircle';
import { takeSelfieFrame } from './takeSelfieFrame';

type Props = {
  active: boolean;
  ready?: boolean;
};

/** Soft selfie camera for one-time face registration (not the scan stage). */
export const SelfiePreview = forwardRef<CameraPreviewLiveHandle, Props>(function SelfiePreview(
  { active, ready = false },
  ref,
) {
  const cameraRef = useRef<CameraView>(null);
  const captureBusyRef = useRef(false);
  const sampleBusyRef = useRef(false);

  useImperativeHandle(ref, () => ({
    takePhoto: async () => {
      if (!active || captureBusyRef.current || !cameraRef.current) {
        return null;
      }
      captureBusyRef.current = true;
      try {
        return await takeSelfieFrame(cameraRef, 0.85);
      } finally {
        captureBusyRef.current = false;
      }
    },
    sampleFrameUri: async () => {
      if (!active || captureBusyRef.current || sampleBusyRef.current || !cameraRef.current) {
        return null;
      }
      sampleBusyRef.current = true;
      try {
        return await takeSelfieFrame(cameraRef, 0.3);
      } finally {
        sampleBusyRef.current = false;
      }
    },
  }));

  if (!active) {
    return <View style={styles.preview} />;
  }

  return (
    <View style={styles.preview}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        mode="picture"
        mirror
        animateShutter={false}
      />
      <SelfieGuideCircle ready={ready} />
    </View>
  );
});

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 360,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    alignSelf: 'center',
  },
});
