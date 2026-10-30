import * as tf from '@tensorflow/tfjs';

import { getFaceDetector } from './faceDetectorSingleton';
import type { DetectedFace } from './evaluateFaceFraming';

export type PixelBuffer = {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
  /** 3 = RGB, 4 = RGBA (jpeg-js default). */
  channels: 3 | 4;
};

/**
 * Run MediaPipe Face Detector on decoded pixels.
 * Returns null when the model is unavailable (caller must not claim “face OK”).
 */
export async function detectFacesFromPixels(image: PixelBuffer): Promise<DetectedFace[] | null> {
  const detector = await getFaceDetector();
  if (!detector) {
    return null;
  }
  const rgb = toRgbFloat32(image);
  const tensor = tf.tensor3d(rgb, [image.height, image.width, 3], 'float32');
  try {
    const faces = await detector.estimateFaces(tensor, { flipHorizontal: false });
    return faces.map((face) => ({
      box: {
        xMin: face.box.xMin,
        yMin: face.box.yMin,
        xMax: face.box.xMax,
        yMax: face.box.yMax,
        width: face.box.width,
        height: face.box.height,
      },
      keypoints: face.keypoints?.map((k) => ({
        x: k.x,
        y: k.y,
        name: k.name,
      })),
    }));
  } finally {
    tensor.dispose();
  }
}

export function toRgbFloat32(image: PixelBuffer): Float32Array {
  const { data, width, height, channels } = image;
  const out = new Float32Array(width * height * 3);
  let o = 0;
  for (let i = 0; i < width * height; i += 1) {
    const s = i * channels;
    out[o] = data[s] ?? 0;
    out[o + 1] = data[s + 1] ?? 0;
    out[o + 2] = data[s + 2] ?? 0;
    o += 3;
  }
  return out;
}
