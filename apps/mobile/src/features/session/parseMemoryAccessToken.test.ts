import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseMemoryAccessToken } from './parseMemoryAccessToken';

describe('parseMemoryAccessToken', () => {
  it('parses uuid and email', () => {
    const parsed = parseMemoryAccessToken(
      'user:11111111-1111-4111-8111-111111111111:alex@example.com',
    );
    assert.deepEqual(parsed, {
      userId: '11111111-1111-4111-8111-111111111111',
      email: 'alex@example.com',
    });
  });

  it('parses uuid-only token', () => {
    const parsed = parseMemoryAccessToken('user:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    assert.equal(parsed?.userId, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    assert.equal(parsed?.email, null);
  });

  it('rejects non-memory tokens', () => {
    assert.equal(parseMemoryAccessToken('Bearer jwt'), null);
  });
});
