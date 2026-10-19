import { CONCERN_IDS, ZONE_IDS } from '@dermis/domain/server';

/** Bump when the system prompt or expected JSON shape changes. */
export const GEMINI_PROMPT_VERSION = 'gemini-scan-v7' as const;

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
    'FACE GATE (do this first — prefer pass for ordinary clear selfies):',
    'Set faceClear=true for a real photo of exactly ONE person whose face is mostly front-facing,',
    'in focus, and large enough to score skin (forehead through chin roughly visible).',
    'Minor crop, soft light, or light hair on the forehead should still pass (faceClear=true).',
    'Set faceClear=false only for clear failures: no person, objects/rooms/animals/drawings/memes,',
    'screenshots, group photos, strong side profile, extremely tiny face, heavy blur, extreme',
    'dark/bright, sunglasses hiding eyes, or face mostly covered by hands/mask/hair.',
    'When faceClear=false, set faceIssue to one of: no_face, multiple_faces, too_far, too_close,',
    'blurry, poor_lighting, obstructed, glasses, not_front_facing — fill concerns/zones with 50,',
    'and set faceGuidance to one short friendly tip naming the problem area when possible',
    '(e.g. "Forehead is cut off — move the phone back." / "Eyes not clear — remove glasses." /',
    '"Chin is out of frame — tilt the camera down a little."). Max 160 characters.',
    'Use glasses when eyewear hides the eyes; use obstructed for hands, hair, masks, or other cover.',
    'When faceClear=true, set faceIssue to none, omit faceGuidance, and score visible facial skin carefully.',
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
