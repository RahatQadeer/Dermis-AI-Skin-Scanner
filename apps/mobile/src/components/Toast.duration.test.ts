import assert from 'node:assert/strict';
import test from 'node:test';

import { motion } from '../theme/motion';

test('toast duration is 2600 ms per product toast rule', () => {
  assert.equal(motion.duration.toast, 2600);
});
