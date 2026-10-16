import assert from 'node:assert/strict';
import test from 'node:test';

test('CI smoke — workspace is wired', () => {
  assert.equal(typeof process.version, 'string');
});
