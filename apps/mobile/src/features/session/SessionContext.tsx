import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { isApiEnabled } from '@/src/lib/api/config';

import type { SkinProfileStatus } from './useSessionIdentityState';
import { useSessionProviderState } from './useSessionProviderState';

export type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  firstName: string | null;
  userId: string | null;
  apiEnabled: boolean;
  /** False until AsyncStorage hydrate finishes — keep native splash up. */
  hydrated: boolean;
  onboardingComplete: boolean;
  /**
   * Backend-authoritative skin-assessment completeness for the signed-in user.
   * 'unknown' while the post-login /v1/profile sync is in flight — routing
   * should wait rather than assume onboarding is done.
   */
  skinProfileStatus: SkinProfileStatus;
  markOnboardingComplete: () => void;
  /** Mark the authenticated user's skin assessment as persisted (post-auth quiz). */
  markSkinProfileComplete: () => void;
  /**
   * When true, auth layout sends the user to paywall once after JWT apply
   * (avoids racing router.replace with a home Redirect).
   */
  postAuthPaywall: boolean;
  consumePostAuthPaywall: () => void;
  /** Real Supabase JWT from `/v1/auth/sign-up` or `/v1/auth/sign-in`. */
  applyServerSession: (session: {
    accessToken: string;
    refreshToken?: string | null;
    email: string | null;
    userId: string;
    firstName?: string | null;
    /** Default true — show dismissible paywall after account create/login. */
    showPaywall?: boolean;
  }) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const state = useSessionProviderState();

  const value = useMemo(
    (): SessionState => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      email: state.email,
      firstName: state.firstName,
      userId: state.userId,
      apiEnabled: isApiEnabled(),
      hydrated: state.hydrated,
      onboardingComplete: state.onboardingComplete,
      skinProfileStatus: state.skinProfileStatus,
      markOnboardingComplete: state.markOnboardingComplete,
      markSkinProfileComplete: state.markSkinProfileComplete,
      postAuthPaywall: state.postAuthPaywall,
      consumePostAuthPaywall: state.consumePostAuthPaywall,
      applyServerSession: state.applyServerSession,
      signOut: state.signOut,
    }),
    [
      state.accessToken,
      state.applyServerSession,
      state.consumePostAuthPaywall,
      state.email,
      state.firstName,
      state.hydrated,
      state.markOnboardingComplete,
      state.markSkinProfileComplete,
      state.onboardingComplete,
      state.skinProfileStatus,
      state.postAuthPaywall,
      state.refreshToken,
      state.signOut,
      state.userId,
    ],
  );

  return createElement(SessionContext.Provider, { value }, children);
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession requires SessionProvider');
  }
  return ctx;
}
