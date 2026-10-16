import assert from 'node:assert/strict';
import test from 'node:test';

import { clampScore } from '../lib/clampScore';
import { buildPolyline } from '../lib/trendPolyline';

test('clampScore bounds 0 and 100', () => {
  assert.equal(clampScore(-5), 0);
  assert.equal(clampScore(105), 100);
  assert.equal(clampScore(70.4), 70);
});

test('buildPolyline handles empty and single points', () => {
  assert.equal(buildPolyline([], 280, 120, 12), '');
  assert.match(buildPolyline([50], 280, 120, 12), /^140,/);
});

test('buildPolyline ends with last point near right pad', () => {
  const path = buildPolyline([0, 100], 280, 120, 12);
  const parts = path.split(' ');
  assert.equal(parts.length, 2);
  assert.ok(parts[1]?.startsWith('268,'));
});
