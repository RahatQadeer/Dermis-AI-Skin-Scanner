import { CameraView } from 'expo-camera';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors, radii } from '@/src/theme';

import { FaceGuideOval } from './FaceGuideOval';

export type CameraPreviewLiveHandle = {
  takePhoto: () => Promise<string | null>;
  /** Cheap low-res frame for the live pre-capture quality check. Null if busy. */
  sampleFrameUri: () => Promise<string | null>;
};

type CameraPreviewLiveProps = {
  active: boolean;
  faceLocked?: boolean;
};

const TAKE_ATTEMPTS = 3;

export const CameraPreviewLive = forwardRef<CameraPreviewLiveHandle, CameraPreviewLiveProps>(
  function CameraPreviewLive({ active, faceLocked = false }, ref) {
    const cameraRef = useRef<CameraView>(null);
    // Serialise capture + sampling — CameraView allows only one shot at a time.
    const busyRef = useRef(false);
    const c = getCopy().screens.camera;

    useImperativeHandle(ref, () => ({
      takePhoto: () => runExclusive(busyRef, active, () => takePictureWithRetry(cameraRef.current)),
      sampleFrameUri: () => runExclusive(busyRef, active, () => sampleFrame(cameraRef.current)),
    }));

    if (!active) {
      return null;
    }

    return (
      <View style={styles.preview} accessibilityLabel={c.previewA11y} accessibilityRole="image">
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
          mode="picture"
          mirror
        />
        <FaceGuideOval locked={faceLocked} />
      </View>
    );
  },
);

/** Run `op` only when the camera is active and not already taking a shot. */
async function runExclusive(
  busyRef: { current: boolean },
  active: boolean,
  op: () => Promise<string | null>,
): Promise<string | null> {
  if (!active || busyRef.current) {
    return null;
  }
  busyRef.current = true;
  try {
    return await op();
  } finally {
    busyRef.current = false;
  }
}

/** Cheap low-res frame for the live quality check. */
async function sampleFrame(camera: CameraView | null): Promise<string | null> {
  if (!camera) {
    return null;
  }
  try {
    const photo = await camera.takePictureAsync({
      quality: 0.3,
      skipProcessing: true,
      shutterSound: false,
      exif: false,
    });
    return photo?.uri ?? null;
  } catch {
    return null;
  }
}

async function takePictureWithRetry(camera: CameraView | null): Promise<string | null> {
  if (!camera) {
    return null;
  }
  for (let attempt = 0; attempt < TAKE_ATTEMPTS; attempt += 1) {
    try {
      const photo = await camera.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
        shutterSound: false,
        exif: false,
      });
      if (photo?.uri) {
        return photo.uri;
      }
    } catch {
      // Expo Go / warm-up races — retry shortly.
    }
    await wait(120 * (attempt + 1));
  }
  return null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    minHeight: 360,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
});
