import assert from 'node:assert/strict';
import test from 'node:test';

import { isCentreScanTab, TAB_BAR_ORDER, TAB_IDS } from './tabBarTypes';

test('tab bar order is home, progress, scan, routine, profile', () => {
  assert.deepEqual([...TAB_BAR_ORDER], ['home', 'progress', 'scan', 'routine', 'profile']);
  assert.equal(TAB_IDS.length, 5);
});

test('scan is the centre tab', () => {
  assert.equal(TAB_BAR_ORDER[2], 'scan');
  assert.equal(isCentreScanTab('scan'), true);
  assert.equal(isCentreScanTab('home'), false);
});
