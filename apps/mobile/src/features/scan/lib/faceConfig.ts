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

/** Cosine-similarity pass threshold; conservative default, tunable per model. */
const DEFAULT_FACE_MATCH_THRESHOLD = 0.55;

export function getFaceMatchThreshold(): number {
  const raw = Number(process.env.EXPO_PUBLIC_FACE_MATCH_THRESHOLD);
  return Number.isFinite(raw) && raw > 0 && raw < 1 ? raw : DEFAULT_FACE_MATCH_THRESHOLD;
}
