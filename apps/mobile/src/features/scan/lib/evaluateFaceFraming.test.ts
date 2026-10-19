import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { evaluateFaceFraming, type DetectedFace } from './evaluateFaceFraming';

const W = 224;
const H = 280;

function faceAt(opts: {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  keypoints?: DetectedFace['keypoints'];
}): DetectedFace {
  return {
    box: {
      xMin: opts.xMin,
      yMin: opts.yMin,
      xMax: opts.xMax,
      yMax: opts.yMax,
      width: opts.xMax - opts.xMin,
      height: opts.yMax - opts.yMin,
    },
    keypoints: opts.keypoints,
  };
}

/** Well-framed centered face (~45% of height). */
function goodFace(): DetectedFace {
  const h = H * 0.45;
  const w = h * 0.75;
  const xMin = (W - w) / 2;
  const yMin = (H - h) / 2;
  return faceAt({
    xMin,
    yMin,
    xMax: xMin + w,
    yMax: yMin + h,
    keypoints: [
      { x: xMin + w * 0.35, y: yMin + h * 0.35, name: 'rightEye' },
      { x: xMin + w * 0.65, y: yMin + h * 0.35, name: 'leftEye' },
      { x: xMin + w * 0.5, y: yMin + h * 0.52, name: 'noseTip' },
      { x: xMin + w * 0.5, y: yMin + h * 0.72, name: 'mouthCenter' },
    ],
  });
}

describe('evaluateFaceFraming', () => {
  it('accepts a centered face filling the oval range', () => {
    const result = evaluateFaceFraming([goodFace()], W, H);
    assert.equal(result.ok, true);
  });

  it('rejects empty detections', () => {
    const result = evaluateFaceFraming([], W, H);
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.issue, 'no_face');
  });

  it('rejects multiple faces', () => {
    const result = evaluateFaceFraming([goodFace(), goodFace()], W, H);
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.issue, 'multiple_faces');
  });

  it('rejects face too far (small)', () => {
    const f = faceAt({ xMin: 90, yMin: 110, xMax: 130, yMax: 160 });
    const result = evaluateFaceFraming([f], W, H);
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.issue, 'too_far');
  });

  it('rejects forehead cut off at top', () => {
    const h = H * 0.45;
    const w = h * 0.75;
    const xMin = (W - w) / 2;
    const f = faceAt({ xMin, yMin: 0, xMax: xMin + w, yMax: h });
    const result = evaluateFaceFraming([f], W, H);
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.issue, 'cut_off_top');
  });

  it('rejects chin cut off at bottom', () => {
    const h = H * 0.45;
    const w = h * 0.75;
    const xMin = (W - w) / 2;
    const f = faceAt({ xMin, yMin: H - h, xMax: xMin + w, yMax: H });
    const result = evaluateFaceFraming([f], W, H);
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.issue, 'cut_off_bottom');
  });

  it('rejects tilted eyes as not front', () => {
    const base = goodFace();
    const kp = (base.keypoints ?? []).map((p) =>
      p.name === 'leftEye' ? { ...p, y: p.y + 40 } : p,
    );
    const result = evaluateFaceFraming([{ ...base, keypoints: kp }], W, H);
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.issue, 'not_front');
  });
});
