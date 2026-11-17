/**
 * Server-side MobileFaceNet embedding so scan identity is bound to uploaded
 * pixels — never trust a client-claimed vector alone.
 */
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs';
import { decode as decodeJpeg } from 'jpeg-js';

const INPUT_SIZE = 112;
const DEFAULT_MODEL_URL =
  'https://cdn.jsdelivr.net/gh/vladmandic/human-models/models/mobilefacenet.json';
const BOX_MARGIN = 0.18;

export type NormalizedFaceBox = {
  /** 0–1 relative to image width/height. */
  xMin: number;
  yMin: number;
  width: number;
  height: number;
};

let modelPromise: Promise<tf.GraphModel | null> | null = null;

export function resolveFaceModelUrl(
  raw: string | undefined = process.env.DERMIS_FACE_MODEL_URL,
): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'off') {
    return DEFAULT_MODEL_URL;
  }
  return trimmed;
}

export function serverFaceModelVersion(): string {
  const url = resolveFaceModelUrl();
  const file = url.split('/').filter(Boolean).pop() ?? 'model';
  return `tfjs:${file}:mfn-n128-align-v5`;
}

async function loadModel(): Promise<tf.GraphModel | null> {
  try {
    await tf.setBackend('cpu');
    await tf.ready();
    return await tf.loadGraphModel(resolveFaceModelUrl());
  } catch (error) {
    console.warn('[serverFaceEmbedder] model load failed', error);
    modelPromise = null;
    return null;
  }
}

function getModel(): Promise<tf.GraphModel | null> {
  if (!modelPromise) {
    modelPromise = loadModel();
  }
  return modelPromise;
}

/** Warm the model at process start (optional). */
export function preloadServerFaceEmbedder(): Promise<tf.GraphModel | null> {
  return getModel();
}

export type EmbedScanFaceInput = {
  jpegBytes: Uint8Array;
  box: NormalizedFaceBox;
};

/**
 * Decode JPEG → crop face box → MobileFaceNet → L2 embedding.
 * Returns null when the model is unavailable (caller must fail closed).
 */
export async function embedScanFace(input: EmbedScanFaceInput): Promise<number[] | null> {
  const model = await getModel();
  if (!model) {
    return null;
  }

  let decoded: { width: number; height: number; data: Uint8Array };
  try {
    decoded = decodeJpeg(input.jpegBytes, {
      useTArray: true,
      formatAsRGBA: true,
      maxMemoryUsageInMB: 64,
    }) as { width: number; height: number; data: Uint8Array };
  } catch {
    return null;
  }
  if (!decoded.width || !decoded.height || !decoded.data) {
    return null;
  }

  const px = toPixelBox(input.box, decoded.width, decoded.height);
  if (!px) {
    return null;
  }

  try {
    return tf.tidy(() => {
      const rgb = rgbaToRgbFloat(decoded.data, decoded.width, decoded.height);
      const full = tf.tensor3d(rgb, [decoded.height, decoded.width, 3], 'float32');
      const crop = full.slice([px.y, px.x, 0], [px.h, px.w, 3]);
      const resized = tf.image.resizeBilinear(crop, [INPUT_SIZE, INPUT_SIZE]);
      const normalized = resized.sub(127.5).mul(0.0078125).expandDims(0) as tf.Tensor4D;
      const out = readEmbedding(model, normalized);
      const flat = out.reshape([out.size]);
      const norm = flat.div(flat.square().sum().sqrt().add(1e-10));
      return Array.from(norm.dataSync());
    });
  } catch (error) {
    console.warn('[serverFaceEmbedder] inference failed', error);
    return null;
  }
}

function readEmbedding(model: tf.GraphModel, input: tf.Tensor4D): tf.Tensor {
  try {
    const named = model.execute(input, 'embeddings');
    if (named instanceof tf.Tensor) return named;
  } catch {
    // fall through
  }
  const raw = model.execute(input);
  if (raw instanceof tf.Tensor) return raw;
  if (Array.isArray(raw)) return raw[0]!;
  const map = raw as Record<string, tf.Tensor>;
  return map.embeddings ?? Object.values(map)[0]!;
}

function rgbaToRgbFloat(data: Uint8Array, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height * 3);
  let o = 0;
  for (let i = 0; i < width * height; i += 1) {
    const s = i * 4;
    out[o] = data[s] ?? 0;
    out[o + 1] = data[s + 1] ?? 0;
    out[o + 2] = data[s + 2] ?? 0;
    o += 3;
  }
  return out;
}

type PixelBox = { x: number; y: number; w: number; h: number };
type RawBox = { x0: number; y0: number; bw: number; bh: number };

function hasFiniteFields(box: NormalizedFaceBox): boolean {
  return (
    Number.isFinite(box.xMin) &&
    Number.isFinite(box.yMin) &&
    Number.isFinite(box.width) &&
    Number.isFinite(box.height)
  );
}

function isNormalizedBox(box: NormalizedFaceBox): boolean {
  const originOk = box.xMin >= 0 && box.yMin >= 0 && box.xMin <= 1.5 && box.yMin <= 1.5;
  const sizeOk = box.width > 0 && box.height > 0 && box.width <= 1.5 && box.height <= 1.5;
  return originOk && sizeOk;
}

/** Accept normalized (0–1) or absolute pixel boxes. */
function toRawBox(box: NormalizedFaceBox, imageW: number, imageH: number): RawBox {
  if (!isNormalizedBox(box)) {
    return { x0: box.xMin, y0: box.yMin, bw: box.width, bh: box.height };
  }
  return {
    x0: box.xMin * imageW,
    y0: box.yMin * imageH,
    bw: box.width * imageW,
    bh: box.height * imageH,
  };
}

function squareCrop(raw: RawBox, imageW: number, imageH: number): PixelBox | null {
  const padX = raw.bw * BOX_MARGIN;
  const padY = raw.bh * BOX_MARGIN;
  const cx = raw.x0 + raw.bw / 2;
  const cy = raw.y0 + raw.bh / 2;
  const side = Math.max(raw.bw + padX * 2, raw.bh + padY * 2, 1);
  let x = Math.round(cx - side / 2);
  let y = Math.round(cy - side / 2);
  let s = Math.round(side);
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + s > imageW) s = imageW - x;
  if (y + s > imageH) s = Math.min(s, imageH - y);
  if (s < 16) return null;
  // Reject tiny / huge faces as likely spoof framing.
  const ratio = s / Math.min(imageW, imageH);
  if (ratio < 0.12 || ratio > 0.95) return null;
  return { x, y, w: s, h: s };
}

function toPixelBox(box: NormalizedFaceBox, imageW: number, imageH: number): PixelBox | null {
  if (!hasFiniteFields(box)) {
    return null;
  }
  return squareCrop(toRawBox(box, imageW, imageH), imageW, imageH);
}

/** Test helper. */
export function resetServerFaceEmbedderForTests(): void {
  modelPromise = null;
}
