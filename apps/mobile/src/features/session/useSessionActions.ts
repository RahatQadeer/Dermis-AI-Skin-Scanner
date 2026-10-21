import { useCallback } from 'react';

import { clearStoredSession, saveOnboardingComplete, saveStoredSession } from './sessionStorage';

export function useSessionActions(ctx: {
  persistSession: (next: {
    accessToken: string;
    refreshToken: string | null;
    email: string | null;
    userId: string;
    firstName: string | null;
  }) => void;
  setPostAuthPaywall: (v: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
  resetIdentity: () => void;
}) {
  const applyServerSession = useCallback(
    (session: {
      accessToken: string;
      refreshToken?: string | null;
      email: string | null;
      userId: string;
      firstName?: string | null;
      showPaywall?: boolean;
    }) => {
      ctx.persistSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken ?? null,
        email: session.email?.trim().toLowerCase() ?? null,
        userId: session.userId,
        firstName: session.firstName?.trim() || null,
      });
      ctx.setPostAuthPaywall(session.showPaywall !== false);
    },
    [ctx],
  );

  const consumePostAuthPaywall = useCallback(() => {
    ctx.setPostAuthPaywall(false);
  }, [ctx]);

  const markOnboardingComplete = useCallback(() => {
    ctx.setOnboardingComplete(true);
    void saveOnboardingComplete(true);
  }, [ctx]);

  const signOut = useCallback(() => {
    ctx.resetIdentity();
    ctx.setPostAuthPaywall(false);
    void clearStoredSession();
    void saveOnboardingComplete(false);
  }, [ctx]);

  return { applyServerSession, consumePostAuthPaywall, markOnboardingComplete, signOut };
}

export function usePersistSession(
  refs: {
    accessTokenRef: { current: string | null };
    refreshTokenRef: { current: string | null };
    emailRef: { current: string | null };
    firstNameRef: { current: string | null };
  },
  setters: {
    setAccessToken: (v: string | null) => void;
    setRefreshToken: (v: string | null) => void;
    setEmail: (v: string | null) => void;
    setUserId: (v: string | null) => void;
    setFirstName: (v: string | null) => void;
  },
) {
  return useCallback(
    (next: {
      accessToken: string;
      refreshToken: string | null;
      email: string | null;
      userId: string;
      firstName: string | null;
    }) => {
      refs.accessTokenRef.current = next.accessToken;
      refs.refreshTokenRef.current = next.refreshToken;
      refs.emailRef.current = next.email;
      refs.firstNameRef.current = next.firstName;
      setters.setAccessToken(next.accessToken);
      setters.setRefreshToken(next.refreshToken);
      setters.setEmail(next.email);
      setters.setUserId(next.userId);
      setters.setFirstName(next.firstName);
      void saveStoredSession(next);
    },
    [refs, setters],
  );
}
