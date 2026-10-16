import type { MascotMood } from '@/src/components/mascot/mascotTypes';
import { getCopy } from '@/src/copy';

export type AuthMascotTone = 'idle' | 'invalid' | 'ready' | 'resetSent';

export function moodForAuthTone(tone: AuthMascotTone): MascotMood {
  if (tone === 'invalid') {
    return 'surprised';
  }
  if (tone === 'ready' || tone === 'resetSent') {
    return 'wink';
  }
  return 'happy';
}

/** Idle shows the screen's own line; reactions override while interacting. */
export function lineForAuthTone(tone: AuthMascotTone, idleLine: string): string {
  const auth = getCopy().auth;
  if (tone === 'invalid') {
    return auth.mascotInvalid;
  }
  if (tone === 'ready') {
    return auth.mascotReady;
  }
  if (tone === 'resetSent') {
    return auth.mascotResetSent;
  }
  return idleLine;
}
