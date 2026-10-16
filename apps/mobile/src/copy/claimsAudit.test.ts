import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { copy } from './catalog';
import { collectCopyStrings, findBannedClaim } from './claimsAudit';

describe('claims audit (DERM-061)', () => {
  it('rejects known banned phrases', () => {
    assert.ok(findBannedClaim('Photos never leave your phone'));
    assert.ok(findBannedClaim('Clinical scoring powered by AI'));
    assert.ok(findBannedClaim('68 landmarks detected'));
    assert.ok(findBannedClaim('Full zone map on every scan'));
  });

  it('allows compliant cloud and disclaimer phrasing', () => {
    assert.equal(findBannedClaim('Secure cloud analysis with Google Gemini'), null);
    assert.equal(findBannedClaim('Not a medical device. Consult a dermatologist.'), null);
    assert.equal(findBannedClaim('Fun skin age estimate only'), null);
  });

  it('copy catalog has no banned claim substrings', () => {
    const leaves = collectCopyStrings(copy);
    const hits = leaves
      .map((line) => {
        const text = line.slice(line.indexOf(': ') + 2);
        const banned = findBannedClaim(text);
        return banned ? `${line} [matched /${banned}/]` : null;
      })
      .filter((value): value is string => value !== null);

    assert.deepEqual(hits, []);
  });
});
