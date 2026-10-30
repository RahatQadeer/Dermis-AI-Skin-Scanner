import { useRef, useState } from 'react';

export type SkinProfileStatus = 'unknown' | 'complete' | 'incomplete';

export function useSessionIdentityState() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  // Backend-authoritative skin-profile completeness for the signed-in user.
  // 'unknown' until the first /v1/profile sync resolves after auth.
  const [skinProfileStatus, setSkinProfileStatus] = useState<SkinProfileStatus>('unknown');
  const [postAuthPaywall, setPostAuthPaywall] = useState(false);

  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const emailRef = useRef<string | null>(null);
  const firstNameRef = useRef<string | null>(null);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  accessTokenRef.current = accessToken;
  refreshTokenRef.current = refreshToken;
  emailRef.current = email;
  firstNameRef.current = firstName;

  return {
    accessToken,
    refreshToken,
    email,
    firstName,
    userId,
    hydrated,
    onboardingComplete,
    skinProfileStatus,
    postAuthPaywall,
    setAccessToken,
    setRefreshToken,
    setEmail,
    setFirstName,
    setUserId,
    setHydrated,
    setOnboardingComplete,
    setSkinProfileStatus,
    setPostAuthPaywall,
    accessTokenRef,
    refreshTokenRef,
    emailRef,
    firstNameRef,
    refreshInFlight,
  };
}
