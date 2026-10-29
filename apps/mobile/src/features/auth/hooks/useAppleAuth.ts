import * as AppleAuthentication from 'expo-apple-authentication';
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { getCopy } from '@/src/copy';

import {
  firstNameFromAppleFullName,
  isAppleCancelError,
  trimAppleIdentityToken,
} from '../lib/appleAuthHelpers';
import { createAppleAuthNonce } from '../lib/appleAuthNonce';
import { completeAppleSignIn, type AppleAuthCallbacks } from './appleAuthSession';

/** Native Apple identityToken → POST /v1/auth/apple (iOS only). */
export function useAppleAuth(callbacks: AppleAuthCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const [busy, setBusy] = useState(false);

  const setSubmitting = useCallback((value: boolean) => {
    setBusy(value);
    callbacksRef.current.onSubmittingChange?.(value);
  }, []);

  const continueApple = useCallback(() => {
    void runAppleSignIn({
      callbacks: callbacksRef.current,
      setSubmitting,
    });
  }, [setSubmitting]);

  return { continueApple, appleBusy: busy };
}

async function runAppleSignIn(input: {
  callbacks: AppleAuthCallbacks;
  setSubmitting: (value: boolean) => void;
}): Promise<void> {
  const { callbacks, setSubmitting } = input;
  const blocked = appleSignInBlockReason(callbacks);
  if (blocked) {
    callbacks.onFormError(blocked);
    return;
  }

  setSubmitting(true);
  try {
    await performAppleCredentialExchange(callbacks);
  } catch (error) {
    if (!isAppleCancelError(error)) {
      console.warn('[auth/apple] native sign-in failed', errorCodeOf(error));
      callbacks.onFormError(getCopy().auth.signInFailed);
    }
  } finally {
    setSubmitting(false);
  }
}

function appleSignInBlockReason(callbacks: AppleAuthCallbacks): string | undefined {
  if (Platform.OS !== 'ios') {
    return getCopy().auth.appleUnavailable;
  }
  if (!callbacks.session.apiEnabled) {
    return getCopy().auth.apiNotConfigured;
  }
  return undefined;
}

async function performAppleCredentialExchange(callbacks: AppleAuthCallbacks): Promise<void> {
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    callbacks.onFormError(getCopy().auth.appleUnavailable);
    return;
  }
  const { rawNonce } = await createAppleAuthNonce();
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    // Pass raw nonce — Apple hashes once into the identity token claim.
    nonce: rawNonce,
  });
  const idToken = trimAppleIdentityToken(credential.identityToken);
  if (!idToken) {
    callbacks.onFormError(getCopy().auth.signInFailed);
    return;
  }
  await completeAppleSignIn(
    callbacks,
    {
      idToken,
      nonce: rawNonce,
      firstName: firstNameFromAppleFullName(credential.fullName),
    },
    () => undefined,
  );
}

function errorCodeOf(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : 'unknown';
  }
  return 'unknown';
}
