import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateScanQuality, type PixelImage } from './evaluateScanQuality';

const W = 60;
const H = 80;

/** Build an RGBA image from a per-pixel luminance function. */
function image(lumaAt: (x: number, y: number) => number): PixelImage {
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const o = (y * W + x) * 4;
      const v = lumaAt(x, y);
      data[o] = v;
      data[o + 1] = v;
      data[o + 2] = v;
      data[o + 3] = 255;
    }
  }
  return { data, width: W, height: H, channels: 4 };
}

test('all-black frame is flagged too dark', () => {
  const result = evaluateScanQuality(image(() => 0));
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.issue, 'too_dark');
});

test('all-white frame is flagged too bright', () => {
  const result = evaluateScanQuality(image(() => 255));
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.issue, 'too_bright');
});

test('strong left/right lighting imbalance is flagged uneven', () => {
  const result = evaluateScanQuality(image((x) => (x < W / 2 ? 10 : 245)));
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.issue, 'uneven_light');
});

test('flat featureless mid-gray frame is flagged blurry', () => {
  const result = evaluateScanQuality(image(() => 128));
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.issue, 'blurry');
});

test('well-lit, high-detail frame passes', () => {
  // Fine checkerboard: even mean luma, lots of high-frequency detail.
  const result = evaluateScanQuality(image((x, y) => ((x + y) % 2 === 0 ? 70 : 190)));
  assert.equal(result.ok, true);
});

test('degenerate tiny image fails open (not rejected)', () => {
  const result = evaluateScanQuality({ data: [0, 0, 0, 255], width: 1, height: 1, channels: 4 });
  assert.equal(result.ok, true);
});

test('accepts 3-channel RGB data', () => {
  const data = new Uint8ClampedArray(W * H * 3);
  for (let i = 0; i < W * H; i += 1) {
    data[i * 3] = 5;
    data[i * 3 + 1] = 5;
    data[i * 3 + 2] = 5;
  }
  const result = evaluateScanQuality({ data, width: W, height: H, channels: 3 });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.issue, 'too_dark');
});
