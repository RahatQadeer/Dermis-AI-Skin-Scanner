import type { NormalizedFaceBox } from './serverFaceEmbedder';

/**
 * Offline, byte-bound face embedding for memory-backend / CI.
 * Different JPEG bytes → different vectors. Never reads a client claim.
 * Not a biometric model — production live path uses MobileFaceNet.
 */
export function deterministicEmbedFromBytes(
  jpegBytes: Uint8Array,
  box: NormalizedFaceBox,
  dim = 128,
): number[] {
  let h = 2166136261;
  const step = Math.max(1, Math.floor(jpegBytes.length / 512));
  for (let i = 0; i < jpegBytes.length; i += step) {
    h ^= jpegBytes[i] ?? 0;
    h = Math.imul(h, 16777619);
  }
  h ^= Math.floor(box.xMin * 10_000) & 0xffff;
  h = Math.imul(h, 16777619);
  h ^= Math.floor(box.yMin * 10_000) & 0xffff;
  h = Math.imul(h, 16777619);
  h ^= Math.floor(box.width * 10_000) & 0xffff;
  h = Math.imul(h, 16777619);
  h ^= Math.floor(box.height * 10_000) & 0xffff;
  h = Math.imul(h, 16777619);
  h ^= jpegBytes.length;

  const out = new Array<number>(dim);
  let seed = h >>> 0;
  for (let i = 0; i < dim; i += 1) {
    seed = Math.imul(seed ^ (seed >>> 13), 1274126177) >>> 0;
    out[i] = (seed % 20_001) / 20_000 - 0.5;
  }
  let norm = 0;
  for (const x of out) norm += x * x;
  norm = Math.sqrt(norm) + 1e-10;
  return out.map((x) => x / norm);
}
