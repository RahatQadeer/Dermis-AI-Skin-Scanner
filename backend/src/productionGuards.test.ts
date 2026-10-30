import assert from 'node:assert/strict';
import test from 'node:test';

import { isUnlockAllFeatures, resolveFreeLifetimeScans } from '@dermis/domain/server';

import { createBackendFromEnv } from './createBackendFromEnv';

function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
  const prev: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(vars)) {
    prev[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    fn();
  } finally {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('testing overrides are ignored in production', () => {
  withEnv(
    {
      NODE_ENV: 'production',
      DERMIS_FORCE_PRO: '1',
      EXPO_PUBLIC_UNLOCK_ALL_FEATURES: '1',
      DERMIS_FREE_LIFETIME_SCANS: '50',
    },
    () => {
      assert.equal(isUnlockAllFeatures(), false);
      assert.equal(resolveFreeLifetimeScans(), 1);
    },
  );
});

test('testing overrides still work locally', () => {
  withEnv({ NODE_ENV: 'development', DERMIS_FORCE_PRO: '1' }, () => {
    assert.equal(isUnlockAllFeatures(), true);
  });
});

test('production refuses to start on the memory backend (accepts unsigned dev tokens)', () => {
  withEnv({ NODE_ENV: 'production' }, () => {
    assert.throws(() => createBackendFromEnv({ useMemory: true }), /memory backend/);
    assert.throws(() => createBackendFromEnv({}), /memory backend/);
  });
});
