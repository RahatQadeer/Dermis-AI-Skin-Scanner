/**
 * Default public MobileFaceNet TFJS graph (vladmandic/human-models).
 * Override with EXPO_PUBLIC_FACE_MODEL_URL. Set to empty / `off` to disable identity.
 */
const DEFAULT_FACE_MODEL_URL =
  'https://cdn.jsdelivr.net/gh/vladmandic/human-models/models/mobilefacenet.json';

/**
 * Face identity verification. Enabled by default via CDN model so another
 * person cannot scan against your registered reference. Set
 * `EXPO_PUBLIC_FACE_MODEL_URL=off` to disable.
 */
export function getFaceModelUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_FACE_MODEL_URL ?? '').trim();
  if (raw.toLowerCase() === 'off' || raw === '0' || raw === 'false') {
    return '';
  }
  if (raw.startsWith('https://') || raw.startsWith('http://')) {
    return raw;
  }
  return DEFAULT_FACE_MODEL_URL;
}

export function isFaceIdentityEnabled(): boolean {
  const url = getFaceModelUrl();
  return url.startsWith('https://') || url.startsWith('http://');
}

/**
 * Strict cosine pass threshold. Same person is typically ≥ ~0.92 with a good
 * crop; different people are usually ≤ ~0.70. Keep this high so impostors fail.
 * Override with EXPO_PUBLIC_FACE_MATCH_THRESHOLD in (0, 1).
 */
/** Strict — other people's faces must not pass as the registered user. */
const DEFAULT_FACE_MATCH_THRESHOLD = 0.94;

export function getFaceMatchThreshold(): number {
  const raw = Number(process.env.EXPO_PUBLIC_FACE_MATCH_THRESHOLD);
  return Number.isFinite(raw) && raw > 0 && raw < 1 ? raw : DEFAULT_FACE_MATCH_THRESHOLD;
}

/**
 * Soft floor under the pass threshold. Scores in [soft, threshold) ask for a
 * clearer selfie (lighting/angle). Anything below is a hard "not registered".
 */
export function getFaceMatchUncertainFloor(threshold = getFaceMatchThreshold()): number {
  return Math.max(0.85, threshold - 0.05);
}
