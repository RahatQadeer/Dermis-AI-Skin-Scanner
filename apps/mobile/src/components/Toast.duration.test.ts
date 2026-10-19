import assert from 'node:assert/strict';
import test from 'node:test';

import { motion } from '../theme/motion';

test('toast duration is 2600 ms per product toast rule', () => {
  assert.equal(motion.duration.toast, 2600);
});

test('important toast duration is 8000 ms for face retake errors', () => {
  assert.equal(motion.duration.toastImportant, 8000);
});
