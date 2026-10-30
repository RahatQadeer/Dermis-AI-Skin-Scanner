/**
 * Face identity verification (approach D2) is OFF until a recognition model URL
 * is configured. With no model, enrollment never happens and the scan flow is
 * unchanged — the gate can never lock anyone out.
 */
export function getFaceModelUrl(): string {
  return (process.env.EXPO_PUBLIC_FACE_MODEL_URL ?? '').trim();
}

export function isFaceIdentityEnabled(): boolean {
  const url = getFaceModelUrl();
  return url.startsWith('https://') || url.startsWith('http://');
}

/** Cosine-similarity pass threshold; conservative default, tunable per model. */
const DEFAULT_FACE_MATCH_THRESHOLD = 0.6;

export function getFaceMatchThreshold(): number {
  const raw = Number(process.env.EXPO_PUBLIC_FACE_MATCH_THRESHOLD);
  return Number.isFinite(raw) && raw > 0 && raw < 1 ? raw : DEFAULT_FACE_MATCH_THRESHOLD;
}
