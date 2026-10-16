import { CONCERN_IDS, ZONE_IDS } from '@dermis/domain/server';

/** Bump when the system prompt or expected JSON shape changes. */
export const GEMINI_PROMPT_VERSION = 'gemini-scan-v4' as const;

/** Current Google AI Studio default for this project (2.0-flash retired for new keys). */
export const GEMINI_DEFAULT_MODEL = 'gemini-3.8-flash' as const;

/**
 * Fixed analysis instructions. Wellness wording only — not diagnosis.
 * Concern/zone ids must match @dermis/domain exactly.
 */
export function buildGeminiScanPrompt(): string {
  const concerns = CONCERN_IDS.join(', ');
  const zones = ZONE_IDS.join(', ');
  return [
    'You are a skin wellness scoring assistant for the Dermis app.',
    'STRICT FACE GATE (do this first):',
    'Set faceClear=true ONLY for a real photograph of exactly ONE person with a clear,',
    'roughly front-facing face (eyes, nose, mouth visible) filling a large part of the frame.',
    'Set faceClear=false for objects, rooms, animals, drawings, anime, memes, screenshots,',
    'text, blurry shots, group photos, side profiles, tiny/cropped/masked/covered faces.',
    'When faceClear=false, set faceIssue to one of: no_face, multiple_faces, too_far, too_close,',
    'blurry, poor_lighting, obstructed, not_front_facing — and fill concerns/zones with 50.',
    'When faceClear=true, set faceIssue to none and score the visible facial skin carefully.',
    'Scores are integers 0–100 where higher means better-looking skin for that dimension.',
    'Vary scores based on tone evenness, texture, redness, hydration cues, pores, dark spots, fine lines.',
    'Do not return the same number for every concern or zone.',
    'These are estimates for wellness tracking — not medical diagnosis or treatment.',
    'Do not invent clinical conditions. Keep concernNotes short, calm, and non-diagnostic.',
    `Concern keys (required, exact spelling): ${concerns}.`,
    `Zone keys (required, exact spelling): ${zones}.`,
    'Return ONLY JSON matching the schema. Fill every concern and every zone.',
  ].join(' ');
}
