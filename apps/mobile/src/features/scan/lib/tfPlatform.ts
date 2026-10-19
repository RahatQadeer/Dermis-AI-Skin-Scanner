import * as tf from '@tensorflow/tfjs';

let registered = false;

/**
 * TFJS expects a browser/Node platform with `.fetch`. React Native / Expo Go
 * leave `env().platform` undefined → "Cannot read property 'fetch' of undefined"
 * when loading MediaPipe weights. Register a minimal RN platform once.
 */
export function ensureTfjsReactNativePlatform(): void {
  if (registered) {
    return;
  }
  const env = tf.env();
  if (env.platform && typeof env.platform.fetch === 'function') {
    registered = true;
    return;
  }

  const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;

  env.setPlatform('react-native', {
    fetch(path: string, init?: RequestInit) {
      return globalThis.fetch(path, init);
    },
    now() {
      return Date.now();
    },
    encode(text: string) {
      if (encoder) {
        return encoder.encode(text);
      }
      // Minimal fallback for environments without TextEncoder.
      const out = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i += 1) {
        out[i] = text.charCodeAt(i) & 0xff;
      }
      return out;
    },
    decode(bytes: Uint8Array) {
      if (decoder) {
        return decoder.decode(bytes);
      }
      let s = '';
      for (let i = 0; i < bytes.length; i += 1) {
        s += String.fromCharCode(bytes[i] ?? 0);
      }
      return s;
    },
    isTypedArray(a: unknown): a is Float32Array | Int32Array | Uint8Array | Uint8ClampedArray {
      return (
        a instanceof Float32Array ||
        a instanceof Int32Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray
      );
    },
  });
  registered = true;
}
