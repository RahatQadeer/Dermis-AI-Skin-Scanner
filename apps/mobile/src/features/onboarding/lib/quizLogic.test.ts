import assert from 'node:assert/strict';
import test from 'node:test';

import {
  emptyQuizDraft,
  isQuizDraftComplete,
  isQuizStepComplete,
  quizDraftToSkinProfile,
  sensitivityKeyFromReaction,
  skinToneFromFitzpatrick,
  skinTypeFromFeel,
  toggleQuizPriority,
} from './quizLogic';

const QUIZ_FIXTURE = {
  q1: {
    options: [{ label: 'Oily' }, { label: 'Combination' }, { label: 'Dry' }, { label: 'Normal' }],
  },
  q2: {
    options: [
      { label: 'Type I–II' },
      { label: 'Type III' },
      { label: 'Type IV' },
      { label: 'Type V–VI' },
    ],
  },
  q4: {
    options: [
      { label: 'Rarely reacts' },
      { label: 'Sometimes stings' },
      { label: 'Reacts easily' },
    ] as [{ label: string }, { label: string }, { label: string }],
  },
};

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

test('skinTypeFromFeel maps labels to enums by option order', () => {
  const options = QUIZ_FIXTURE.q1.options;
  assert.equal(skinTypeFromFeel('Oily', options), 'oily');
  assert.equal(skinTypeFromFeel('Combination', options), 'combination');
  assert.equal(skinTypeFromFeel('Normal', options), 'normal');
  assert.equal(skinTypeFromFeel('Unknown', options), null);
  assert.equal(skinTypeFromFeel(null, options), null);
});

test('skinToneFromFitzpatrick maps Fitzpatrick labels to enums', () => {
  const options = QUIZ_FIXTURE.q2.options;
  assert.equal(skinToneFromFitzpatrick('Type I–II', options), 'typeI_II');
  assert.equal(skinToneFromFitzpatrick('Type III', options), 'typeIII');
  assert.equal(skinToneFromFitzpatrick('Type V–VI', options), 'typeV_VI');
  assert.equal(skinToneFromFitzpatrick('Type VII', options), null);
});

test('quizDraftToSkinProfile builds the backend payload from a complete draft', () => {
  const draft = emptyQuizDraft();
  draft.skinFeel = 'Dry';
  draft.fitzpatrick = 'Type IV';
  draft.priorities = ['hydration', 'redness'];
  draft.productReaction = 'Reacts easily';
  assert.deepEqual(quizDraftToSkinProfile(draft, QUIZ_FIXTURE), {
    skinType: 'dry',
    skinTone: 'typeIV',
    sensitivity: 'easily',
    priorityConcerns: ['hydration', 'redness'],
  });
});

test('quizDraftToSkinProfile returns null when the draft is incomplete', () => {
  const draft = emptyQuizDraft();
  draft.skinFeel = 'Dry';
  assert.equal(quizDraftToSkinProfile(draft, QUIZ_FIXTURE), null);
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
