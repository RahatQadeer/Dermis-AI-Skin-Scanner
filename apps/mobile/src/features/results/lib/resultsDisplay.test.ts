import assert from 'node:assert/strict';
import test from 'node:test';

import { pickPreviousScan } from './resultsDisplay';

test('pickPreviousScan returns the scan right before the current one', () => {
  const rows = [{ id: 's3' }, { id: 's2' }, { id: 's1' }] as unknown as Parameters<
    typeof pickPreviousScan
  >[0];
  assert.equal(pickPreviousScan(rows, 's3')?.id, 's2');
  assert.equal(pickPreviousScan(rows, 's1'), null);
});

test('pickPreviousScan uses the newest listed scan when current is not listed yet', () => {
  const rows = [{ id: 's2' }, { id: 's1' }] as unknown as Parameters<typeof pickPreviousScan>[0];
  assert.equal(pickPreviousScan(rows, 's3-fresh')?.id, 's2');
  assert.equal(pickPreviousScan([], 's3-fresh'), null);
});
