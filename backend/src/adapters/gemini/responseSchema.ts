import { CONCERN_IDS, ZONE_IDS } from '@dermis/domain/server';

/**
 * Gemini responseSchema (OpenAPI-ish) for responseMimeType=application/json.
 * Keep in sync with geminiScanAnalysisSchema in @dermis/domain.
 */
export function buildGeminiResponseSchema(): Record<string, unknown> {
  const scoreProp = { type: 'INTEGER', minimum: 0, maximum: 100 };
  const concernProps = Object.fromEntries(CONCERN_IDS.map((id) => [id, scoreProp]));
  const zoneProps = Object.fromEntries(ZONE_IDS.map((id) => [id, scoreProp]));
  const noteProps = Object.fromEntries(
    CONCERN_IDS.map((id) => [id, { type: 'STRING', maxLength: 500 }]),
  );

  return {
    type: 'OBJECT',
    properties: {
      faceClear: { type: 'BOOLEAN' },
      faceIssue: {
        type: 'STRING',
        enum: [
          'none',
          'no_face',
          'multiple_faces',
          'too_far',
          'too_close',
          'blurry',
          'poor_lighting',
          'obstructed',
          'glasses',
          'not_front_facing',
        ],
      },
      faceGuidance: { type: 'STRING', maxLength: 160 },
      concerns: {
        type: 'OBJECT',
        properties: concernProps,
        required: [...CONCERN_IDS],
      },
      zones: {
        type: 'OBJECT',
        properties: zoneProps,
        required: [...ZONE_IDS],
      },
      concernNotes: {
        type: 'OBJECT',
        properties: noteProps,
      },
    },
    required: ['faceClear', 'concerns', 'zones'],
  };
}
