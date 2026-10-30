import assert from 'node:assert/strict';
import test from 'node:test';

import { clampFont, scaleHeight } from './responsive';

test('scaleHeight caps a fixed height to a fraction of the viewport', () => {
  // Short screen (568) → capped below the design height.
  assert.equal(scaleHeight(330, 568, 0.45), 256);
  // Tall screen → keeps the design height.
  assert.equal(scaleHeight(330, 900, 0.45), 330);
});

test('clampFont keeps base on reference/large widths and shrinks on narrow', () => {
  assert.equal(clampFont(36, 390), 36); // reference width
  assert.equal(clampFont(36, 430), 36); // larger never exceeds base
  assert.ok(clampFont(36, 320) < 36); // narrow shrinks
  assert.ok(clampFont(36, 320) >= Math.round(36 * 0.8)); // never below floor
});

test('clampFont respects an explicit minimum', () => {
  assert.equal(clampFont(30, 200, 26), 26);
});
