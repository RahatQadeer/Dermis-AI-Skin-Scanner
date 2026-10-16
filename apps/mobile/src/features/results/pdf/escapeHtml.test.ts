import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    assert.equal(
      escapeHtml(`<a href="x">&'y</a>`),
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;y&lt;/a&gt;',
    );
  });
});
