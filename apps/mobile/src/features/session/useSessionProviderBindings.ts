import { bindApiRefreshHandler, bindApiTokenGetter } from '@/src/lib/api/client';

import {
  useSessionMeProfileSync,
  useSessionRefreshToken,
  useSessionStorageHydrate,
} from './sessionProviderEffects';
import { usePersistSession } from './useSessionActions';
import type { useSessionIdentityState } from './useSessionIdentityState';

type Identity = ReturnType<typeof useSessionIdentityState>;

export function useSessionProviderBindings(identity: Identity) {
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
  });

  bindApiTokenGetter(() => identity.accessTokenRef.current);
  bindApiRefreshHandler(refreshAccessToken);

  useSessionMeProfileSync({
    accessToken: identity.accessToken,
    refreshToken: identity.refreshToken,
    hydrated: identity.hydrated,
    setUserId: identity.setUserId,
    setEmail: identity.setEmail,
    setFirstName: identity.setFirstName,
  });

  return { persistSession };
}

export function resetSessionIdentity(identity: Identity): void {
  identity.setAccessToken(null);
  identity.setRefreshToken(null);
  identity.setEmail(null);
  identity.setFirstName(null);
  identity.setUserId(null);
  identity.setOnboardingComplete(false);
}
