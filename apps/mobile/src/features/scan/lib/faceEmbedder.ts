import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs';

import { getFaceModelUrl } from './faceConfig';
import { toRgbFloat32, type PixelBuffer } from './detectFacesFromPixels';
import { ensureTfjsReactNativePlatform } from './tfPlatform';

/** MobileFaceNet-style square input. */
const INPUT_SIZE = 112;
const RETRY_COOLDOWN_MS = 8000;

export type FaceBoxLike = { xMin: number; yMin: number; width: number; height: number };

let modelPromise: Promise<tf.GraphModel | null> | null = null;
let ready = false;
let nextRetryAt = 0;

export function isFaceEmbedderReady(): boolean {
  return ready;
}

/** The embedding model version tag persisted with a reference (for migrations). */
export function faceModelVersion(): string {
  const url = getFaceModelUrl();
  const file = url.split('/').filter(Boolean).pop() ?? 'model';
  return `tfjs:${file}`;
}

async function loadModel(): Promise<tf.GraphModel | null> {
  const url = getFaceModelUrl();
  if (!url) {
    return null;
  }
  try {
    ensureTfjsReactNativePlatform();
    await tf.setBackend('cpu');
    await tf.ready();
    const model = await tf.loadGraphModel(url);
    ready = true;
    nextRetryAt = 0;
    return model;
  } catch (error) {
    if (__DEV__) {
      console.warn('[faceEmbedder] failed to load model', error);
    }
    ready = false;
    modelPromise = null;
    nextRetryAt = Date.now() + RETRY_COOLDOWN_MS;
    return null;
  }
}

function getModel(): Promise<tf.GraphModel | null> {
  if (modelPromise) {
    return modelPromise;
  }
  if (Date.now() < nextRetryAt) {
    return Promise.resolve(null);
  }
  modelPromise = loadModel();
  return modelPromise;
}

function cropResizeNormalize(image: PixelBuffer, box: FaceBoxLike): tf.Tensor4D {
  const rgb = toRgbFloat32(image);
  const full = tf.tensor3d(rgb, [image.height, image.width, 3], 'float32');
  const x = Math.max(0, Math.min(Math.round(box.xMin), image.width - 1));
  const y = Math.max(0, Math.min(Math.round(box.yMin), image.height - 1));
  const w = Math.max(1, Math.min(Math.round(box.width), image.width - x));
  const h = Math.max(1, Math.min(Math.round(box.height), image.height - y));
  const crop = full.slice([y, x, 0], [h, w, 3]);
  const resized = tf.image.resizeBilinear(crop, [INPUT_SIZE, INPUT_SIZE]);
  // Normalize to [0, 1] (vladmandic MobileFaceNet / human-models convention).
  return resized.div(255).expandDims(0) as tf.Tensor4D;
}

/**
 * Computes an L2-normalized face embedding for the given face box, or null if
 * the model is unavailable (caller must fail-closed when a reference exists).
 */
export async function computeFaceEmbedding(
  image: PixelBuffer,
  box: FaceBoxLike,
): Promise<number[] | null> {
  const model = await getModel();
  if (!model) {
    return null;
  }
  try {
    return tf.tidy(() => {
      const input = cropResizeNormalize(image, box);
      const raw = model.predict(input);
      const out = (Array.isArray(raw) ? raw[0]! : raw) as tf.Tensor;
      const flat = out.reshape([out.size]);
      const norm = flat.div(flat.square().sum().sqrt().add(1e-10));
      return Array.from(norm.dataSync());
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[faceEmbedder] inference failed', error);
    }
    return null;
  }
}

/** Warm the recognition model so enroll/verify is not delayed on first capture. */
export function preloadFaceEmbedder(): Promise<tf.GraphModel | null> {
  return getModel();
}

/** Test helper — reset singleton between unit tests. */
export function resetFaceEmbedderForTests(): void {
  modelPromise = null;
  ready = false;
  nextRetryAt = 0;
}
