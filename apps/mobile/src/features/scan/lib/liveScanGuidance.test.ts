import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { combineLiveAssessment } from './liveScanGuidance';

describe('combineLiveAssessment', () => {
  it('prefers face failure over lighting', () => {
    const result = combineLiveAssessment(
      { status: 'fail', issue: 'no_face' },
      { ok: false, issue: 'too_dark' },
    );
    assert.deepEqual(result, { ok: false, issue: 'no_face' });
  });

  it('requires face ok before lighting can pass overall', () => {
    assert.deepEqual(
      combineLiveAssessment({ status: 'ok' }, { ok: false, issue: 'blurry' }),
      { ok: false, issue: 'blurry' },
    );
    assert.deepEqual(combineLiveAssessment({ status: 'ok' }, { ok: true }), { ok: true });
  });

  it('never reports ok while detector is loading', () => {
    assert.deepEqual(combineLiveAssessment({ status: 'loading' }, { ok: true }), {
      ok: false,
      issue: 'detector_loading',
    });
  });
});
