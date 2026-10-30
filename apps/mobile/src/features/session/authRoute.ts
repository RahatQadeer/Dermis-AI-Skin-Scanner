import type { SkinProfileStatus } from './useSessionIdentityState';

export type AuthedRoute = '/quiz' | '/(tabs)/home';

/**
 * Post-authentication destination driven by backend skin-profile completeness.
 * Returns null while the profile sync is still resolving so callers can hold a
 * loading state instead of flashing the wrong screen (home for an unonboarded
 * user, or the quiz for an existing one).
 */
export function resolveAuthedRoute(status: SkinProfileStatus): AuthedRoute | null {
  if (status === 'unknown') {
    return null;
  }
  return status === 'incomplete' ? '/quiz' : '/(tabs)/home';
}
