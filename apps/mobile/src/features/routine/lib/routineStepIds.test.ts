import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isPersistedStepId, localStepId } from './routineStepIds';

describe('routineStepIds', () => {
  it('detects server UUIDs vs local mock ids', () => {
    assert.equal(isPersistedStepId('48bb8707-a7c8-4f54-8166-7a79682ae093'), true);
    assert.equal(isPersistedStepId('am-1'), false);
    assert.equal(isPersistedStepId('am-local-vit-c-1'), false);
  });

  it('builds a local id for a period', () => {
    const id = localStepId('am', 'Vitamin C 10%');
    assert.match(id, /^am-local-/);
    assert.equal(isPersistedStepId(id), false);
  });
});
