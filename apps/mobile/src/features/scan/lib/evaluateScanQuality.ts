/**
 * Pure, on-device pre-capture quality heuristic.
 *
 * Reads a downscaled frame's pixels (RGB/RGBA) and flags the most common
 * reasons a scan gets rejected by the server face-gate: poor lighting and
 * gross blur. Catching these locally lets us guide the user *before* the
 * upload + analysis round-trip instead of after it.
 *
 * Design rule: be conservative. We only reject clearly-bad frames. Anything
 * borderline passes through to the server face-gate (which validates the face
 * itself). Fewer false rejections matters more than catching every bad frame.
 *
 * No Expo/native imports here on purpose — this stays unit-testable.
 */

export type ScanQualityIssue = 'too_dark' | 'too_bright' | 'uneven_light' | 'blurry';

export type ScanQualityMetrics = {
  /** Mean luminance across the frame, 0–255. */
  meanLuma: number;
  /** Fraction of near-black pixels, 0–1. */
  darkFraction: number;
  /** Fraction of near-white (blown) pixels, 0–1. */
  brightFraction: number;
  /** Max minus min block-mean luminance over a 3×3 grid, 0–255. */
  blockSpread: number;
  /** Variance of the discrete Laplacian — higher means sharper. */
  focus: number;
};

export type ScanQualityResult =
  | { ok: true; metrics: ScanQualityMetrics }
  | { ok: false; issue: ScanQualityIssue; metrics: ScanQualityMetrics };

export type PixelImage = {
  /** Interleaved RGB or RGBA samples, row-major. */
  data: ArrayLike<number>;
  width: number;
  height: number;
  /** Samples per pixel. Defaults to 4 (RGBA, as emitted by jpeg-js). */
  channels?: 3 | 4;
};

/** Conservative gates — tuned to reject only clearly-bad frames. */
export const SCAN_QUALITY_THRESHOLDS = {
  /** Mean luminance below this = too dark to analyse. */
  minMeanLuma: 48,
  /** Mean luminance above this = blown out / washed. */
  maxMeanLuma: 214,
  /** Block-mean spread above this hints at strong directional/back lighting. */
  unevenSpread: 135,
  /** ...but only call it uneven when a genuinely shadowed region exists. */
  unevenDarkFraction: 0.12,
  /** Laplacian variance below this = effectively featureless/very blurred. */
  minFocus: 6,
  /** Skip the blur check below this mean luminance (metric gets noisy in the dark). */
  focusDarkFloor: 55,
} as const;

export type ScanQualityThresholds = typeof SCAN_QUALITY_THRESHOLDS;

const DARK_PIXEL = 40;
const BRIGHT_PIXEL = 245;
const GRID = 3;

function failOpenMetrics(): ScanQualityMetrics {
  return { meanLuma: 0, darkFraction: 0, brightFraction: 0, blockSpread: 0, focus: 0 };
}

/** Per-pixel luminance plane plus brightness summary stats. */
function lumaStats(
  data: ArrayLike<number>,
  pxCount: number,
  channels: number,
): { luma: Float64Array; meanLuma: number; darkFraction: number; brightFraction: number } {
  const luma = new Float64Array(pxCount);
  let sum = 0;
  let dark = 0;
  let bright = 0;
  for (let i = 0; i < pxCount; i += 1) {
    const o = i * channels;
    const y = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
    luma[i] = y;
    sum += y;
    if (y < DARK_PIXEL) dark += 1;
    else if (y > BRIGHT_PIXEL) bright += 1;
  }
  return {
    luma,
    meanLuma: sum / pxCount,
    darkFraction: dark / pxCount,
    brightFraction: bright / pxCount,
  };
}

/** Max minus min block-mean luminance over a GRID×GRID grid — back/side lighting. */
function blockSpread(luma: Float64Array, width: number, height: number): number {
  const blockSum = new Float64Array(GRID * GRID);
  const blockCnt = new Float64Array(GRID * GRID);
  for (let yy = 0; yy < height; yy += 1) {
    const by = Math.min(GRID - 1, Math.floor((yy / height) * GRID));
    for (let xx = 0; xx < width; xx += 1) {
      const bx = Math.min(GRID - 1, Math.floor((xx / width) * GRID));
      const b = by * GRID + bx;
      blockSum[b] += luma[yy * width + xx];
      blockCnt[b] += 1;
    }
  }
  let bMin = Infinity;
  let bMax = -Infinity;
  for (let b = 0; b < GRID * GRID; b += 1) {
    if (blockCnt[b] === 0) continue;
    const m = blockSum[b] / blockCnt[b];
    if (m < bMin) bMin = m;
    if (m > bMax) bMax = m;
  }
  return bMax - bMin;
}

/** Variance of the discrete Laplacian over interior pixels — sharpness proxy. */
function focusScore(luma: Float64Array, width: number, height: number): number {
  let lapSum = 0;
  let lapSqSum = 0;
  let lapN = 0;
  for (let yy = 1; yy < height - 1; yy += 1) {
    for (let xx = 1; xx < width - 1; xx += 1) {
      const idx = yy * width + xx;
      const lap =
        4 * luma[idx] - luma[idx - 1] - luma[idx + 1] - luma[idx - width] - luma[idx + width];
      lapSum += lap;
      lapSqSum += lap * lap;
      lapN += 1;
    }
  }
  if (!lapN) return 0;
  const lapMean = lapSum / lapN;
  return lapSqSum / lapN - lapMean * lapMean;
}

function classify(m: ScanQualityMetrics, t: ScanQualityThresholds): ScanQualityIssue | null {
  if (m.meanLuma < t.minMeanLuma) return 'too_dark';
  if (m.meanLuma > t.maxMeanLuma) return 'too_bright';
  if (m.blockSpread > t.unevenSpread && m.darkFraction > t.unevenDarkFraction)
    return 'uneven_light';
  if (m.meanLuma >= t.focusDarkFloor && m.focus < t.minFocus) return 'blurry';
  return null;
}

export function evaluateScanQuality(
  image: PixelImage,
  thresholds: ScanQualityThresholds = SCAN_QUALITY_THRESHOLDS,
): ScanQualityResult {
  const { width, height, data } = image;
  const channels = image.channels ?? 4;
  const pxCount = width * height;

  // Not enough data to judge — fail open (let the server decide).
  if (width < 2 || height < 2 || pxCount <= 0 || data.length < pxCount * channels) {
    return { ok: true, metrics: failOpenMetrics() };
  }

  const { luma, meanLuma, darkFraction, brightFraction } = lumaStats(data, pxCount, channels);
  const metrics: ScanQualityMetrics = {
    meanLuma,
    darkFraction,
    brightFraction,
    blockSpread: blockSpread(luma, width, height),
    focus: focusScore(luma, width, height),
  };

  const issue = classify(metrics, thresholds);
  return issue ? { ok: false, issue, metrics } : { ok: true, metrics };
}
