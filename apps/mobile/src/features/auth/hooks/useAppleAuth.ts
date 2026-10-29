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
  if (Platform.OS !== 'ios') {
    callbacks.onFormError(getCopy().auth.appleUnavailable);
    return;
  }
  if (!callbacks.session.apiEnabled) {
    callbacks.onFormError(getCopy().auth.apiNotConfigured);
    return;
  }

  setSubmitting(true);
  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      callbacks.onFormError(getCopy().auth.appleUnavailable);
      return;
    }
    const { rawNonce, hashedNonce } = await createAppleAuthNonce();
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
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
  } catch (error) {
    if (!isAppleCancelError(error)) {
      callbacks.onFormError(getCopy().auth.signInFailed);
    }
  } finally {
    setSubmitting(false);
  }
}
