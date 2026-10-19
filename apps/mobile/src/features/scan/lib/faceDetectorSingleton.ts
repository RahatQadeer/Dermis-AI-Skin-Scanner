import '@tensorflow/tfjs-backend-cpu';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs';

import { ensureTfjsReactNativePlatform } from './tfPlatform';

type Detector = faceDetection.FaceDetector;

let detectorPromise: Promise<Detector | null> | null = null;
let ready = false;
/** After a hard failure, wait before retrying so we do not spam load attempts. */
let nextRetryAt = 0;
const RETRY_COOLDOWN_MS = 8000;

/** True once the on-device MediaPipe face model has loaded successfully. */
export function isFaceDetectorReady(): boolean {
  return ready;
}

/**
 * Lazy-load MediaPipe Face Detector (TFJS runtime + CPU backend).
 * Registers a React Native fetch platform first (required in Expo Go).
 */
export function getFaceDetector(): Promise<Detector | null> {
  if (ready && detectorPromise) {
    return detectorPromise;
  }
  if (detectorPromise) {
    return detectorPromise;
  }
  if (Date.now() < nextRetryAt) {
    return Promise.resolve(null);
  }
  detectorPromise = loadDetector();
  return detectorPromise;
}

async function loadDetector(): Promise<Detector | null> {
  try {
    ensureTfjsReactNativePlatform();
    await tf.setBackend('cpu');
    await tf.ready();
    const detector = await faceDetection.createDetector(
      faceDetection.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: 'tfjs',
        maxFaces: 2,
        modelType: 'short',
      },
    );
    ready = true;
    nextRetryAt = 0;
    return detector;
  } catch (error) {
    if (__DEV__) {
      console.warn('[faceDetector] failed to load', error);
    }
    ready = false;
    detectorPromise = null;
    nextRetryAt = Date.now() + RETRY_COOLDOWN_MS;
    return null;
  }
}

/** Test helper — reset singleton between unit tests. */
export function resetFaceDetectorForTests(): void {
  detectorPromise = null;
  ready = false;
  nextRetryAt = 0;
}
