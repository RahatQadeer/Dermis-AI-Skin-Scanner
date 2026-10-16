import { CameraView } from 'expo-camera';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors, radii } from '@/src/theme';

import { FaceGuideOval } from './FaceGuideOval';

export type CameraPreviewLiveHandle = {
  takePhoto: () => Promise<string | null>;
};

type CameraPreviewLiveProps = {
  active: boolean;
  faceLocked?: boolean;
};

export const CameraPreviewLive = forwardRef<CameraPreviewLiveHandle, CameraPreviewLiveProps>(
  function CameraPreviewLive({ active, faceLocked = false }, ref) {
    const cameraRef = useRef<CameraView>(null);
    const c = getCopy().screens.camera;

    useImperativeHandle(ref, () => ({
      async takePhoto() {
        if (!active) {
          return null;
        }
        const photo = await cameraRef.current?.takePictureAsync({
          quality: 1,
          skipProcessing: false,
        });
        return photo?.uri ?? null;
      },
    }));

    if (!active) {
      return null;
    }

    return (
      <View style={styles.preview} accessibilityLabel={c.previewA11y} accessibilityRole="image">
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
        <FaceGuideOval locked={faceLocked} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    minHeight: 360,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
});
