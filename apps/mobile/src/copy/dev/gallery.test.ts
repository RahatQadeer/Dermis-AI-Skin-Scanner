import assert from 'node:assert/strict';
import test from 'node:test';

import { galleryCopy } from './gallery';

test('gallery defines all Epic 1 section titles', () => {
  const keys = Object.keys(galleryCopy.sections);
  assert.deepEqual(keys.sort(), [
    'data',
    'feedback',
    'inputs',
    'layout',
    'mascot',
    'monetization',
    'primitives',
  ]);
});
