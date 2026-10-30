import { bindApiRefreshHandler, bindApiTokenGetter } from '@/src/lib/api/client';

import {
  useSessionMeProfileSync,
  useSessionRefreshToken,
  useSessionStorageHydrate,
} from './sessionProviderEffects';
import { usePersistSession } from './useSessionActions';
import type { useSessionIdentityState } from './useSessionIdentityState';
import { useSessionProfileSync } from './useSessionProfileSync';

type Identity = ReturnType<typeof useSessionIdentityState>;

export function useSessionProviderBindings(
  identity: Identity,
  signOutRef: { current: () => void },
) {
  useSessionStorageHydrate({
    setAccessToken: identity.setAccessToken,
    setRefreshToken: identity.setRefreshToken,
    setEmail: identity.setEmail,
    setFirstName: identity.setFirstName,
    setUserId: identity.setUserId,
    setHydrated: identity.setHydrated,
    setOnboardingComplete: identity.setOnboardingComplete,
  });

  const persistSession = usePersistSession(
    {
      accessTokenRef: identity.accessTokenRef,
      refreshTokenRef: identity.refreshTokenRef,
      emailRef: identity.emailRef,
      firstNameRef: identity.firstNameRef,
    },
    {
      setAccessToken: identity.setAccessToken,
      setRefreshToken: identity.setRefreshToken,
      setEmail: identity.setEmail,
      setUserId: identity.setUserId,
      setFirstName: identity.setFirstName,
    },
  );

  const refreshAccessToken = useSessionRefreshToken({
    persistSession,
    refreshTokenRef: identity.refreshTokenRef,
    emailRef: identity.emailRef,
    firstNameRef: identity.firstNameRef,
    refreshInFlight: identity.refreshInFlight,
    onRefreshRejected: () => signOutRef.current(),
  });

  bindApiTokenGetter(() => identity.accessTokenRef.current);
  bindApiRefreshHandler(refreshAccessToken);
  useSessionSyncEffects(identity);

  return { persistSession };
}

/** Post-auth background syncs: /v1/auth/me identity + /v1/profile completeness. */
function useSessionSyncEffects(identity: Identity): void {
  useSessionMeProfileSync({
    accessToken: identity.accessToken,
    refreshToken: identity.refreshToken,
    hydrated: identity.hydrated,
    setUserId: identity.setUserId,
    setEmail: identity.setEmail,
    setFirstName: identity.setFirstName,
  });

  useSessionProfileSync({
    accessToken: identity.accessToken,
    hydrated: identity.hydrated,
    onboardingComplete: identity.onboardingComplete,
    setSkinProfileStatus: identity.setSkinProfileStatus,
    setOnboardingComplete: identity.setOnboardingComplete,
  });
}

export function resetSessionIdentity(identity: Identity): void {
  // Clear the refs now, not on the next render: an in-flight token refresh
  // compares against them and must see the session as gone immediately.
  identity.accessTokenRef.current = null;
  identity.refreshTokenRef.current = null;
  identity.refreshInFlight.current = null;
  identity.setAccessToken(null);
  identity.setRefreshToken(null);
  identity.setEmail(null);
  identity.setFirstName(null);
  identity.setUserId(null);
  // Skin-profile completeness is per-user; force a fresh backend resolve on the
  // next login. `onboardingComplete` stays sticky (device has seen the intro),
  // so a returning logged-out user lands on sign-in rather than the welcome tour.
  identity.setSkinProfileStatus('unknown');
}
