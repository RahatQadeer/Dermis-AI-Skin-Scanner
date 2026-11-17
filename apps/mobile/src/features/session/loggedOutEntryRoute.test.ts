import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loggedOutEntryRoute } from './loggedOutEntryRoute';

describe('loggedOutEntryRoute', () => {
  it('sends first-time devices to Welcome', () => {
    assert.equal(loggedOutEntryRoute(false), '/welcome');
  });

  it('sends returning logged-out devices to Log in', () => {
    assert.equal(loggedOutEntryRoute(true), '/log-in');
  });
});
