import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasActiveProEntitlement, packageForPlan } from './paywallPackages';

describe('paywallPackages', () => {
  it('selects package by plan', () => {
    const map = {
      annual: {
        identifier: 'a',
        priceString: '$1',
        priceAmount: 1,
        packageType: 'ANNUAL' as const,
      },
      monthly: {
        identifier: 'm',
        priceString: '$2',
        priceAmount: 2,
        packageType: 'MONTHLY' as const,
      },
    };
    assert.equal(packageForPlan(map, 'annual')?.identifier, 'a');
    assert.equal(packageForPlan(map, 'monthly')?.identifier, 'm');
  });

  it('detects pro entitlement id', () => {
    assert.equal(hasActiveProEntitlement(['pro']), true);
    assert.equal(hasActiveProEntitlement(['other']), false);
  });
});
