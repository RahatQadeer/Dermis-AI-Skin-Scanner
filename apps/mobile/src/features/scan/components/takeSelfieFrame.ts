import type { CameraView } from 'expo-camera';
import type { RefObject } from 'react';

/** Capture one selfie frame at the given JPEG quality; null on any failure. */
export async function takeSelfieFrame(
  cameraRef: RefObject<CameraView | null>,
  quality: number,
): Promise<string | null> {
  if (!cameraRef.current) {
    return null;
  }
  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality,
      skipProcessing: true,
      shutterSound: false,
      exif: false,
    });
    return photo?.uri ?? null;
  } catch {
    return null;
  }
}
