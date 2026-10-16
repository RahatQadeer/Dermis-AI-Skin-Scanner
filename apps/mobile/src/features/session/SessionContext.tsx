import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { isApiEnabled } from '@/src/lib/api/config';

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
  markOnboardingComplete: () => void;
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
      markOnboardingComplete: state.markOnboardingComplete,
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
      state.onboardingComplete,
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
