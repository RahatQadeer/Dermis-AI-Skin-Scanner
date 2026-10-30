import { useCallback, useEffect } from 'react';

import { refreshSession } from '@/src/features/auth/api/authApi';
import { getApiClient } from '@/src/lib/api/client';
import { isApiEnabled } from '@/src/lib/api/config';

import { parseMemoryAccessToken } from './parseMemoryAccessToken';
import { isRefreshRejected, isRefreshStillCurrent } from './refreshOutcome';
import { loadOnboardingComplete, loadStoredSession, saveStoredSession } from './sessionStorage';

type AuthMeUser = {
  id: string;
  email: string | null;
  firstName?: string | null;
};

type SessionSetters = {
  setAccessToken: (v: string | null) => void;
  setRefreshToken: (v: string | null) => void;
  setEmail: (v: string | null) => void;
  setFirstName: (v: string | null) => void;
  setUserId: (v: string | null) => void;
  setHydrated: (v: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
};

export function useSessionStorageHydrate(setters: SessionSetters): void {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [stored, onboarding] = await Promise.all([
          loadStoredSession(),
          loadOnboardingComplete(),
        ]);
        if (cancelled) {
          return;
        }
        if (stored) {
          setters.setAccessToken(stored.accessToken);
          setters.setRefreshToken(stored.refreshToken);
          setters.setEmail(stored.email);
          setters.setFirstName(stored.firstName);
          const fromMemory = parseMemoryAccessToken(stored.accessToken)?.userId ?? null;
          setters.setUserId(stored.userId ?? fromMemory);
        }
        setters.setOnboardingComplete(onboarding);
      } finally {
        if (!cancelled) {
          setters.setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Setters from useState are stable; hydrate once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);
}

export function useSessionRefreshToken(ctx: {
  persistSession: (next: {
    accessToken: string;
    refreshToken: string | null;
    email: string | null;
    userId: string;
    firstName: string | null;
  }) => void;
  refreshTokenRef: { current: string | null };
  emailRef: { current: string | null };
  firstNameRef: { current: string | null };
  refreshInFlight: { current: Promise<string | null> | null };
  /** Called when the server rejects the refresh token (session unrecoverable). */
  onRefreshRejected: () => void;
}) {
  return useCallback(async (): Promise<string | null> => {
    if (ctx.refreshInFlight.current) {
      return ctx.refreshInFlight.current;
    }
    const rt = ctx.refreshTokenRef.current;
    if (!rt || !isApiEnabled()) {
      return null;
    }
    const job: Promise<string | null> = runRefresh(ctx, rt).finally(() => {
      // Sign-out may already have cleared (or replaced) the in-flight slot.
      if (ctx.refreshInFlight.current === job) {
        ctx.refreshInFlight.current = null;
      }
    });
    ctx.refreshInFlight.current = job;
    return job;
  }, [ctx]);
}

type RefreshCtx = Parameters<typeof useSessionRefreshToken>[0];

/** One refresh attempt; discards the result if the session changed meanwhile. */
async function runRefresh(ctx: RefreshCtx, rt: string): Promise<string | null> {
  try {
    const session = await refreshSession(rt);
    if (!isRefreshStillCurrent(rt, ctx.refreshTokenRef.current)) {
      // Signed out (or another account signed in) while this was in flight.
      return null;
    }
    ctx.persistSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken ?? rt,
      email: session.user.email ?? ctx.emailRef.current,
      userId: session.user.id,
      firstName: session.user.firstName ?? ctx.firstNameRef.current,
    });
    return session.accessToken;
  } catch (err: unknown) {
    if (isRefreshRejected(err) && isRefreshStillCurrent(rt, ctx.refreshTokenRef.current)) {
      ctx.onRefreshRejected();
    }
    return null;
  }
}

export function useSessionMeProfileSync(ctx: {
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setUserId: (v: string) => void;
  setEmail: (fn: (prev: string | null) => string | null) => void;
  setFirstName: (fn: (prev: string | null) => string | null) => void;
}): void {
  useEffect(() => {
    if (!ctx.hydrated || !ctx.accessToken || !isApiEnabled()) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().get<{ user: AuthMeUser }>('/v1/auth/me');
        if (cancelled || !me.user.id) {
          return;
        }
        applyMeToProfile({
          user: me.user,
          accessToken: ctx.accessToken!,
          refreshToken: ctx.refreshToken,
          setUserId: ctx.setUserId,
          setEmail: ctx.setEmail,
          setFirstName: ctx.setFirstName,
        });
      } catch {
        // Keep session; refresh handler may recover on the next API call.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ctx]);
}

function applyMeToProfile(ctx: {
  user: AuthMeUser;
  accessToken: string;
  refreshToken: string | null;
  setUserId: (v: string) => void;
  setEmail: (fn: (prev: string | null) => string | null) => void;
  setFirstName: (fn: (prev: string | null) => string | null) => void;
}): void {
  const meFirst =
    typeof ctx.user.firstName === 'string' && ctx.user.firstName.trim().length > 0
      ? ctx.user.firstName.trim()
      : null;
  ctx.setUserId(ctx.user.id);
  ctx.setEmail((prevEmail) => {
    const nextEmail = ctx.user.email ?? prevEmail;
    ctx.setFirstName((prevFirst) => {
      const nextFirst = meFirst ?? prevFirst;
      void saveStoredSession({
        accessToken: ctx.accessToken,
        refreshToken: ctx.refreshToken,
        email: nextEmail,
        userId: ctx.user.id,
        firstName: nextFirst,
      });
      return nextFirst;
    });
    return nextEmail;
  });
}
