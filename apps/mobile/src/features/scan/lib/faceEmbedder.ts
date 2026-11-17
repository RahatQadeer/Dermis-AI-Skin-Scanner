import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs';

import { getFaceModelUrl } from './faceConfig';
import { toRgbFloat32, type PixelBuffer } from './detectFacesFromPixels';
import { ensureTfjsReactNativePlatform } from './tfPlatform';

/** MobileFaceNet square input. */
const INPUT_SIZE = 112;
/** Pad around the detector box before square crop (keeps jaw/forehead). */
const BOX_MARGIN = 0.18;
const RETRY_COOLDOWN_MS = 8000;

export type FaceBoxLike = { xMin: number; yMin: number; width: number; height: number };

export type FaceLandmarkLike = {
  box: FaceBoxLike;
  /** MediaPipe names: rightEye / leftEye (subject's perspective). */
  rightEye?: { x: number; y: number };
  leftEye?: { x: number; y: number };
};

let modelPromise: Promise<tf.GraphModel | null> | null = null;
let ready = false;
let nextRetryAt = 0;

export function isFaceEmbedderReady(): boolean {
  return ready;
}

/**
 * Embedding pipeline version. Bump when preprocess/alignment changes so old
 * references are rejected and the user must re-enroll.
 *
 * v4: Sirius MobileFaceNet (x-127.5)/128 + eye align + named embeddings output.
 */
export function faceModelVersion(): string {
  const url = getFaceModelUrl();
  const file = url.split('/').filter(Boolean).pop() ?? 'model';
  // v5: enrolled selfie required on server; invalidate old vector-only refs.
  return `tfjs:${file}:mfn-n128-align-v5`;
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

/** Axis-aligned square crop centered on the face box (with margin). */
function squareCropBox(box: FaceBoxLike, imageW: number, imageH: number): FaceBoxLike {
  const padX = box.width * BOX_MARGIN;
  const padY = box.height * BOX_MARGIN;
  const x0 = box.xMin - padX;
  const y0 = box.yMin - padY;
  const x1 = box.xMin + box.width + padX;
  const y1 = box.yMin + box.height + padY;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const side = Math.max(x1 - x0, y1 - y0, 1);
  const half = side / 2;
  let xMin = cx - half;
  let yMin = cy - half;
  let xMax = cx + half;
  let yMax = cy + half;
  // Shift into frame without changing size when possible.
  if (xMin < 0) {
    xMax -= xMin;
    xMin = 0;
  }
  if (yMin < 0) {
    yMax -= yMin;
    yMin = 0;
  }
  if (xMax > imageW) {
    xMin -= xMax - imageW;
    xMax = imageW;
  }
  if (yMax > imageH) {
    yMin -= yMax - imageH;
    yMax = imageH;
  }
  xMin = Math.max(0, xMin);
  yMin = Math.max(0, yMin);
  xMax = Math.min(imageW, xMax);
  yMax = Math.min(imageH, yMax);
  return {
    xMin,
    yMin,
    width: Math.max(1, xMax - xMin),
    height: Math.max(1, yMax - yMin),
  };
}

/**
 * Eye-roll angle in radians (right→left). Positive = left eye higher in image space.
 * Returns 0 when landmarks are missing.
 */
function eyeAlignRadians(face: FaceLandmarkLike): number {
  const re = face.rightEye;
  const le = face.leftEye;
  if (!re || !le) {
    return 0;
  }
  const dx = le.x - re.x;
  const dy = le.y - re.y;
  if (Math.abs(dx) + Math.abs(dy) < 1e-3) {
    return 0;
  }
  return Math.atan2(dy, dx);
}

/**
 * Build 112×112×1×3 float tensor with Sirius MobileFaceNet norm: (x - 127.5) / 128.
 * Eye alignment improves separation between different people.
 * Must run inside `tf.tidy`.
 */
function cropResizeNormalize(image: PixelBuffer, face: FaceLandmarkLike): tf.Tensor4D {
  const rgb = toRgbFloat32(image);
  const full = tf.tensor3d(rgb, [image.height, image.width, 3], 'float32');
  const box = squareCropBox(face.box, image.width, image.height);
  const x = Math.max(0, Math.min(Math.round(box.xMin), image.width - 1));
  const y = Math.max(0, Math.min(Math.round(box.yMin), image.height - 1));
  const w = Math.max(1, Math.min(Math.round(box.width), image.width - x));
  const h = Math.max(1, Math.min(Math.round(box.height), image.height - y));
  const crop = full.slice([y, x, 0], [h, w, 3]);

  const angle = eyeAlignRadians({
    box: face.box,
    rightEye: face.rightEye
      ? { x: face.rightEye.x - x, y: face.rightEye.y - y }
      : undefined,
    leftEye: face.leftEye
      ? { x: face.leftEye.x - x, y: face.leftEye.y - y }
      : undefined,
  });

  const useAlign = Math.abs(angle) > 0.02 && Math.abs(angle) < 0.6;
  const aligned = useAlign
    ? (tf.image.rotateWithOffset(crop.expandDims(0) as tf.Tensor4D, -angle).squeeze([
        0,
      ]) as tf.Tensor3D)
    : crop;

  const resized = tf.image.resizeBilinear(aligned, [INPUT_SIZE, INPUT_SIZE]);
  // Sirius / MobileFaceNet training norm — critical for person separation.
  return resized.sub(127.5).mul(0.0078125).expandDims(0) as tf.Tensor4D;
}

function asLandmark(face: FaceBoxLike | FaceLandmarkLike): FaceLandmarkLike {
  if ('box' in face) {
    return face;
  }
  return { box: face };
}

/**
 * Computes an L2-normalized face embedding for the given face, or null if
 * the model is unavailable (caller must fail-closed when a reference exists).
 */
export async function computeFaceEmbedding(
  image: PixelBuffer,
  face: FaceBoxLike | FaceLandmarkLike,
): Promise<number[] | null> {
  const model = await getModel();
  if (!model) {
    return null;
  }
  try {
    const values = tf.tidy(() => {
      const input = cropResizeNormalize(image, asLandmark(face));
      const out = readEmbeddingTensor(model, input);
      const flat = out.reshape([out.size]);
      const norm = flat.div(flat.square().sum().sqrt().add(1e-10));
      return Array.from(norm.dataSync());
    });
    // Reject collapsed / empty vectors — they falsely match everyone.
    if (!isUsableEmbedding(values)) {
      return null;
    }
    return values;
  } catch (error) {
    if (__DEV__) {
      console.warn('[faceEmbedder] inference failed', error);
    }
    return null;
  }
}

function readEmbeddingTensor(model: tf.GraphModel, input: tf.Tensor4D): tf.Tensor {
  try {
    const named = model.execute(input, 'embeddings');
    if (named instanceof tf.Tensor) {
      return named;
    }
  } catch {
    // Fall through to predict / default execute.
  }
  const raw = model.execute(input);
  if (raw instanceof tf.Tensor) {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw[0]!;
  }
  const map = raw as Record<string, tf.Tensor>;
  return map.embeddings ?? Object.values(map)[0]!;
}

/** Guard against near-zero / constant vectors that would accept any face. */
function isUsableEmbedding(values: number[]): boolean {
  if (values.length < 64) {
    return false;
  }
  let absSum = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const v of values) {
    if (!Number.isFinite(v)) {
      return false;
    }
    const a = Math.abs(v);
    absSum += a;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (absSum < 0.1) {
    return false;
  }
  // Near-constant vector → no identity signal.
  return max - min > 0.01;
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
