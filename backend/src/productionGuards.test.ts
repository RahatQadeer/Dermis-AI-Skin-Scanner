import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isBillingOpen,
  isUnlockAllFeatures,
  resolveFreeLifetimeScans,
} from '@dermis/domain/server';

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

test('open billing mode works in production', () => {
  withEnv({ NODE_ENV: 'production', DERMIS_BILLING_MODE: 'open' }, () => {
    assert.equal(isBillingOpen(), true);
    assert.equal(isUnlockAllFeatures(), false);
  });
});

test('billing defaults to open when unset', () => {
  withEnv({ NODE_ENV: 'production', DERMIS_BILLING_MODE: undefined, EXPO_PUBLIC_BILLING_MODE: undefined }, () => {
    assert.equal(isBillingOpen(), true);
  });
});

test('store billing mode re-enables gates', () => {
  withEnv({ NODE_ENV: 'production', DERMIS_BILLING_MODE: 'store' }, () => {
    assert.equal(isBillingOpen(), false);
  });
});

test('production refuses to start on the memory backend (accepts unsigned dev tokens)', () => {
  withEnv({ NODE_ENV: 'production' }, () => {
    assert.throws(() => createBackendFromEnv({ useMemory: true }), /memory backend/);
    assert.throws(() => createBackendFromEnv({}), /memory backend/);
  });
});
