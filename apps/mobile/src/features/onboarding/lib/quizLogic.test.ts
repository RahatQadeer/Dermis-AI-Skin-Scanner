import assert from 'node:assert/strict';
import test from 'node:test';

import {
  emptyQuizDraft,
  isQuizDraftComplete,
  isQuizStepComplete,
  sensitivityKeyFromReaction,
  toggleQuizPriority,
} from './quizLogic';

test('isQuizStepComplete requires answers per step', () => {
  const draft = emptyQuizDraft();
  assert.equal(isQuizStepComplete(1, draft), false);
  draft.skinFeel = 'Dry';
  assert.equal(isQuizStepComplete(1, draft), true);
  draft.priorities = ['hydration'];
  assert.equal(isQuizStepComplete(3, draft), true);
});

test('sensitivityKeyFromReaction follows quiz option order', () => {
  const options = [
    { label: 'Rarely reacts' },
    { label: 'Sometimes stings' },
    { label: 'Reacts easily' },
  ] as const;
  assert.equal(sensitivityKeyFromReaction('Rarely reacts', options), 'rarely');
  assert.equal(sensitivityKeyFromReaction('Reacts easily', options), 'easily');
});

test('isQuizDraftComplete requires all steps', () => {
  const draft = emptyQuizDraft();
  assert.equal(isQuizDraftComplete(draft), false);
  draft.skinFeel = 'Dry';
  draft.fitzpatrick = 'Type III';
  draft.priorities = ['hydration'];
  draft.productReaction = 'Rarely reacts';
  assert.equal(isQuizDraftComplete(draft), true);
});

test('toggleQuizPriority enforces max three', () => {
  let list = toggleQuizPriority([], 'redness');
  list = toggleQuizPriority(list, 'texture');
  list = toggleQuizPriority(list, 'pores');
  list = toggleQuizPriority(list, 'hydration');
  assert.deepEqual(list, ['redness', 'texture', 'pores']);
  list = toggleQuizPriority(list, 'redness');
  assert.deepEqual(list, ['texture', 'pores']);
});
