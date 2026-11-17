import { useEffect } from 'react';

import { isApiEnabled } from '@/src/lib/api/config';

import { resolveSkinProfileStatus } from './resolveSkinProfileStatus';
import { saveOnboardingComplete } from './sessionStorage';
import type { SkinProfileStatus } from './useSessionIdentityState';

type ProfileSyncCtx = {
  accessToken: string | null;
  userId: string | null;
  hydrated: boolean;
  onboardingComplete: boolean;
  setSkinProfileStatus: (v: SkinProfileStatus) => void;
  setOnboardingComplete: (v: boolean) => void;
  /** Dead JWT — clear session so reload lands on Log in, not the quiz. */
  onAuthExpired: () => void;
};

function applyResolved(
  status: SkinProfileStatus,
  ctx: ProfileSyncCtx,
  cancelled: () => boolean,
): void {
  if (cancelled() || status === 'unknown') {
    return;
  }
  ctx.setSkinProfileStatus(status);
  if (status === 'complete') {
    ctx.setOnboardingComplete(true);
    void saveOnboardingComplete(true);
  }
}

/**
 * Resolves whether the signed-in user has completed the skin assessment, using
 * the backend profile as the source of truth (not just the local flag).
 */
export function useSessionProfileSync(ctx: ProfileSyncCtx): void {
  const { accessToken, userId, hydrated } = ctx;

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!accessToken || !userId) {
      ctx.setSkinProfileStatus('unknown');
      return;
    }
    if (!isApiEnabled()) {
      ctx.setSkinProfileStatus(ctx.onboardingComplete ? 'complete' : 'incomplete');
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;
    ctx.setSkinProfileStatus('unknown');

    void (async () => {
      const first = await resolveSkinProfileStatus(userId);
      if (cancelled) {
        return;
      }
      if (first === 'auth_expired') {
        ctx.onAuthExpired();
        return;
      }
      if (first !== 'unknown') {
        applyResolved(first, ctx, isCancelled);
        return;
      }
      await new Promise((r) => setTimeout(r, 800));
      if (cancelled) {
        return;
      }
      const second = await resolveSkinProfileStatus(userId);
      if (cancelled) {
        return;
      }
      if (second === 'auth_expired') {
        ctx.onAuthExpired();
        return;
      }
      // Still unknown after retry: hold loader — never invent "incomplete" (re-opens quiz).
      applyResolved(second, ctx, isCancelled);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, userId, hydrated]);
}
