import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  concernScoresSchema,
  consentRecordSchema,
  geminiScanAnalysisSchema,
  scanRecordSchema,
  skinProfileSchema,
} from './index';

const validConcerns = {
  redness: 80,
  fineLines: 77,
  hydration: 72,
  darkSpots: 69,
  texture: 64,
  pores: 58,
};

const validZones = {
  forehead: 70,
  tZone: 65,
  leftCheek: 72,
  rightCheek: 71,
  periorbital: 68,
  chin: 66,
};

describe('Zod schemas', () => {
  it('rejects concern scores out of range', () => {
    assert.equal(concernScoresSchema.safeParse({ ...validConcerns, pores: 101 }).success, false);
    assert.equal(concernScoresSchema.safeParse({ ...validConcerns, pores: -1 }).success, false);
  });

  it('rejects profile with more than 3 priorities', () => {
    const result = skinProfileSchema.safeParse({
      skinType: 'normal',
      skinTone: 'typeIII',
      priorityConcerns: ['pores', 'texture', 'hydration', 'redness'],
      sensitivity: 'rarely',
    });
    assert.equal(result.success, false);
  });

  it('accepts valid Gemini analysis payload', () => {
    assert.equal(
      geminiScanAnalysisSchema.safeParse({
        faceClear: true,
        concerns: validConcerns,
        zones: validZones,
      }).success,
      true,
    );
  });

  it('rejects Gemini payload missing zones', () => {
    assert.equal(
      geminiScanAnalysisSchema.safeParse({
        faceClear: true,
        concerns: validConcerns,
      }).success,
      false,
    );
  });

  it('rejects Gemini payload missing faceClear', () => {
    assert.equal(
      geminiScanAnalysisSchema.safeParse({ concerns: validConcerns, zones: validZones }).success,
      false,
    );
  });

  it('rejects invalid consent datetime', () => {
    assert.equal(
      consentRecordSchema.safeParse({
        type: 'face_analysis',
        version: 'v1',
        grantedAt: 'not-a-date',
      }).success,
      false,
    );
  });

  it('rejects scan record with wrong formula version', () => {
    const base = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      takenAt: '2026-01-15T12:00:00.000Z',
      indexScore: 70,
      concerns: validConcerns,
      zones: validZones,
      formulaVersion: 'index-v1',
      weights: {
        redness: 1,
        fineLines: 1,
        hydration: 1,
        darkSpots: 1,
        texture: 1,
        pores: 1,
      },
      model: 'gemini-2.0-flash',
      promptVersion: 'scan-v1',
      idempotencyKey: 'idem-key-12345678',
    };
    assert.equal(scanRecordSchema.safeParse(base).success, true);
    assert.equal(
      scanRecordSchema.safeParse({ ...base, formulaVersion: 'index-v0' }).success,
      false,
    );
  });
});
