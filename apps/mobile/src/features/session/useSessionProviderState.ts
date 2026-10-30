import { useSessionActions } from './useSessionActions';
import { useSessionIdentityState } from './useSessionIdentityState';
import { resetSessionIdentity, useSessionProviderBindings } from './useSessionProviderBindings';

export function useSessionProviderState() {
  const identity = useSessionIdentityState();
  const { persistSession } = useSessionProviderBindings(identity);
  const actions = useSessionActions({
    persistSession,
    setPostAuthPaywall: identity.setPostAuthPaywall,
    setOnboardingComplete: identity.setOnboardingComplete,
    setSkinProfileStatus: identity.setSkinProfileStatus,
    resetIdentity: () => resetSessionIdentity(identity),
  });

  return {
    accessToken: identity.accessToken,
    refreshToken: identity.refreshToken,
    email: identity.email,
    firstName: identity.firstName,
    userId: identity.userId,
    hydrated: identity.hydrated,
    onboardingComplete: identity.onboardingComplete,
    skinProfileStatus: identity.skinProfileStatus,
    postAuthPaywall: identity.postAuthPaywall,
    markOnboardingComplete: actions.markOnboardingComplete,
    markSkinProfileComplete: actions.markSkinProfileComplete,
    consumePostAuthPaywall: actions.consumePostAuthPaywall,
    applyServerSession: actions.applyServerSession,
    signOut: actions.signOut,
  };
}
