import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { decode as decodeJpeg } from 'jpeg-js';

const MAX_DECODE_MB = 16;

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = (() => {
  const table = new Int16Array(256).fill(-1);
  for (let i = 0; i < B64.length; i += 1) {
    table[B64.charCodeAt(i)] = i;
  }
  return table;
})();

function base64ToUint8Array(base64: string): Uint8Array {
  const len = base64.length;
  const out = new Uint8Array(Math.floor((len * 3) / 4));
  let p = 0;
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < len; i += 1) {
    const v = B64_LOOKUP[base64.charCodeAt(i)];
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[p] = (buffer >> bits) & 0xff;
      p += 1;
    }
  }
  return p === out.length ? out : out.subarray(0, p);
}

export type DecodedRgba = {
  data: Uint8Array;
  width: number;
  height: number;
};

/** Resize + JPEG-decode a local image URI to RGBA pixels. */
export async function decodeJpegPixels(
  uri: string,
  widthPx: number,
): Promise<DecodedRgba | null> {
  try {
    const small = await manipulateAsync(uri, [{ resize: { width: widthPx } }], {
      compress: 0.92,
      format: SaveFormat.JPEG,
      base64: true,
    });
    if (!small.base64) {
      return null;
    }
    const bytes = base64ToUint8Array(small.base64);
    const decoded = decodeJpeg(bytes, {
      useTArray: true,
      formatAsRGBA: true,
      maxMemoryUsageInMB: MAX_DECODE_MB,
    });
    if (!decoded.width || !decoded.height || !decoded.data) {
      return null;
    }
    return {
      data: decoded.data as Uint8Array,
      width: decoded.width,
      height: decoded.height,
    };
  } catch {
    return null;
  }
}
