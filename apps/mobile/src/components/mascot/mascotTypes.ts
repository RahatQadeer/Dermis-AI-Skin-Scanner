export const MASCOT_CHARACTERS = ['dermis', 'professorPuff'] as const;
export type MascotCharacter = (typeof MASCOT_CHARACTERS)[number];

/** Six moods shared by both characters. */
export const MASCOT_MOODS = ['idle', 'happy', 'wink', 'wow', 'think', 'surprised'] as const;
export type MascotMood = (typeof MASCOT_MOODS)[number];

export type MascotMotionKind = 'bob' | 'blink' | 'hop' | 'sway' | 'none';

export function defaultMotionForMood(mood: MascotMood): MascotMotionKind {
  switch (mood) {
    case 'happy':
      return 'bob';
    case 'surprised':
      return 'hop';
    case 'wink':
      return 'blink';
    case 'wow':
      return 'bob';
    case 'think':
      return 'bob';
    case 'idle':
    default:
      return 'bob';
  }
}
