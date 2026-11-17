/**
 * Logged-out entry:
 * - Never finished onboarding on this device → Welcome / quiz
 * - Already saw onboarding → Log in (create account is one tap away)
 */
export function loggedOutEntryRoute(onboardingComplete: boolean): '/log-in' | '/welcome' {
  return onboardingComplete ? '/log-in' : '/welcome';
}
