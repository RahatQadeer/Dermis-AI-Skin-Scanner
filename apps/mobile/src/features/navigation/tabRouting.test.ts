import assert from 'node:assert/strict';
import test from 'node:test';

import { routeForTab, tabIdFromPathname } from './tabRouting';

test('tabIdFromPathname maps tab routes', () => {
  assert.equal(tabIdFromPathname('/home'), 'home');
  assert.equal(tabIdFromPathname('/routine'), 'routine');
  assert.equal(tabIdFromPathname('/progress'), 'progress');
  assert.equal(tabIdFromPathname('/progress/scan-1'), 'progress');
  assert.equal(tabIdFromPathname('/profile'), 'profile');
  assert.equal(tabIdFromPathname('/ai-consent'), 'scan');
  assert.equal(tabIdFromPathname('/face-enroll'), 'scan');
  assert.equal(tabIdFromPathname('/results'), 'home');
  assert.equal(tabIdFromPathname('/assistant'), 'home');
});

test('routeForTab returns expo hrefs', () => {
  assert.equal(routeForTab('home'), '/(tabs)/home');
  assert.equal(routeForTab('scan', false), '/(scan)/ai-consent');
  assert.equal(routeForTab('scan', true), '/(scan)/camera');
});
