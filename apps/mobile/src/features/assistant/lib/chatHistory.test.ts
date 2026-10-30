import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_TURNS, toApiTurns, type ChatMessage } from './chatHistory';

const msg = (i: number, role: 'user' | 'assistant'): ChatMessage => ({
  id: String(i),
  role,
  text: `m${String(i)}`,
});

test('keeps the latest turns within the API limit, starting with the user', () => {
  const history = Array.from({ length: 20 }, (_, i) => msg(i, i % 2 === 0 ? 'user' : 'assistant'));
  history.push(msg(20, 'user'));
  const turns = toApiTurns(history);
  assert.ok(turns.length <= MAX_TURNS);
  assert.equal(turns[0]!.role, 'user');
  assert.equal(turns[turns.length - 1]!.text, 'm20');
});

test('trims over-long text and drops empty turns', () => {
  const turns = toApiTurns([
    { id: 'a', role: 'user', text: '   ' },
    { id: 'b', role: 'user', text: 'x'.repeat(1500) },
  ]);
  assert.equal(turns.length, 1);
  assert.equal(turns[0]!.text.length, 1000);
});
