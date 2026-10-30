import { useCallback } from 'react';

import { writeLocalFaceConsent } from '@/src/features/consent/localConsentStore';
import { clearQuizDraft } from '@/src/features/onboarding/lib/quizDraftStorage';

import { clearStoredSession, saveOnboardingComplete, saveStoredSession } from './sessionStorage';

type ServerSession = {
  accessToken: string;
  refreshToken?: string | null;
  email: string | null;
  userId: string;
  firstName?: string | null;
  showPaywall?: boolean;
};

type PersistInput = {
  accessToken: string;
  refreshToken: string | null;
  email: string | null;
  userId: string;
  firstName: string | null;
};

function toPersistInput(session: ServerSession): PersistInput {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken ?? null,
    email: session.email?.trim().toLowerCase() ?? null,
    userId: session.userId,
    firstName: session.firstName?.trim() || null,
  };
}

/** Drops per-user local caches on logout so nothing leaks to the next account. */
function clearPerUserLocalCaches(): void {
  void clearQuizDraft();
  void writeLocalFaceConsent(false);
}

export function useSessionActions(ctx: {
  persistSession: (next: PersistInput) => void;
  setPostAuthPaywall: (v: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
  setSkinProfileStatus: (v: 'unknown' | 'complete' | 'incomplete') => void;
  resetIdentity: () => void;
}) {
  const applyServerSession = useCallback(
    (session: ServerSession) => {
      ctx.persistSession(toPersistInput(session));
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

  // Post-auth quiz path: the assessment is persisted, so route off the quiz.
  const markSkinProfileComplete = useCallback(() => {
    ctx.setSkinProfileStatus('complete');
    ctx.setOnboardingComplete(true);
    void saveOnboardingComplete(true);
  }, [ctx]);

  // Onboarding intro flag stays sticky; per-user routing is re-resolved from the
  // backend profile on next login, so existing users are never re-onboarded.
  const signOut = useCallback(() => {
    ctx.resetIdentity();
    ctx.setPostAuthPaywall(false);
    void clearStoredSession();
    clearPerUserLocalCaches();
  }, [ctx]);

  return {
    applyServerSession,
    consumePostAuthPaywall,
    markOnboardingComplete,
    markSkinProfileComplete,
    signOut,
  };
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
