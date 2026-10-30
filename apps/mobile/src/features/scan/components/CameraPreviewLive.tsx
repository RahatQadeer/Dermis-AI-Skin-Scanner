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
const SAMPLE_WAIT_MS = 2000;

export const CameraPreviewLive = forwardRef<CameraPreviewLiveHandle, CameraPreviewLiveProps>(
  function CameraPreviewLive({ active, faceLocked = false }, ref) {
    const cameraRef = useRef<CameraView>(null);
    // Separate locks so live sampling cannot starve an explicit capture.
    const captureBusyRef = useRef(false);
    const sampleBusyRef = useRef(false);
    const c = getCopy().screens.camera;

    useImperativeHandle(ref, () => ({
      takePhoto: () => takeExclusive(cameraRef, active, captureBusyRef, sampleBusyRef),
      sampleFrameUri: () => sampleExclusive(cameraRef, active, captureBusyRef, sampleBusyRef),
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

async function takeExclusive(
  cameraRef: { current: CameraView | null },
  active: boolean,
  captureBusyRef: { current: boolean },
  sampleBusyRef: { current: boolean },
): Promise<string | null> {
  if (!active || captureBusyRef.current) {
    return null;
  }
  captureBusyRef.current = true;
  try {
    const deadline = Date.now() + SAMPLE_WAIT_MS;
    while (sampleBusyRef.current && Date.now() < deadline) {
      await wait(50);
    }
    return await takePictureWithRetry(cameraRef.current);
  } finally {
    captureBusyRef.current = false;
  }
}

async function sampleExclusive(
  cameraRef: { current: CameraView | null },
  active: boolean,
  captureBusyRef: { current: boolean },
  sampleBusyRef: { current: boolean },
): Promise<string | null> {
  if (!active || captureBusyRef.current || sampleBusyRef.current) {
    return null;
  }
  sampleBusyRef.current = true;
  try {
    return await sampleFrame(cameraRef.current);
  } finally {
    sampleBusyRef.current = false;
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
