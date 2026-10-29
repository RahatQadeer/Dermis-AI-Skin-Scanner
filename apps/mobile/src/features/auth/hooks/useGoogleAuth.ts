import ExpoConstants, { ExecutionEnvironment } from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getCopy } from '@/src/copy';

import { getGoogleAuthClientIds } from '../lib/googleAuthConfig';
import {
  handleGoogleAuthResponse,
  type GoogleAuthCallbacks,
} from './googleAuthSession';

WebBrowser.maybeCompleteAuthSession();

const PLACEHOLDER_CLIENT_ID = '000000000000-placeholder.apps.googleusercontent.com';

function isExpoGo(): boolean {
  return ExpoConstants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** Google id_token → POST /v1/auth/google. Falls back to email copy when client IDs unset. */
export function useGoogleAuth(callbacks: GoogleAuthCallbacks) {
  const ids = getGoogleAuthClientIds();
  const configured = ids !== null;
  const pendingRef = useRef(false);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    configured
      ? {
          iosClientId: ids.iosClientId,
          webClientId: ids.webClientId,
        }
      : { clientId: PLACEHOLDER_CLIENT_ID },
  );

  const setSubmitting = useCallback((value: boolean) => {
    setBusy(value);
    callbacksRef.current.onSubmittingChange?.(value);
  }, []);

  useEffect(() => {
    handleGoogleAuthResponse({
      response,
      pendingRef,
      setSubmitting,
      callbacks: callbacksRef.current,
    });
  }, [response, setSubmitting]);

  const continueGoogle = useCallback(() => {
    if (isExpoGo()) {
      callbacksRef.current.onFormError(getCopy().auth.googleNeedsDevBuild);
      return;
    }
    startGooglePrompt({
      configured,
      request,
      promptAsync,
      pendingRef,
      setSubmitting,
      callbacks: callbacksRef.current,
    });
  }, [configured, promptAsync, request, setSubmitting]);

  return { continueGoogle, googleBusy: busy };
}

function startGooglePrompt(input: {
  configured: boolean;
  request: unknown;
  promptAsync: () => Promise<unknown>;
  pendingRef: { current: boolean };
  setSubmitting: (value: boolean) => void;
  callbacks: GoogleAuthCallbacks;
}): void {
  const { configured, request, promptAsync, pendingRef, setSubmitting, callbacks } = input;
  if (!configured || !request) {
    callbacks.onFormError(getCopy().auth.socialNotAvailable);
    return;
  }
  if (!callbacks.session.apiEnabled) {
    callbacks.onFormError(getCopy().auth.apiNotConfigured);
    return;
  }
  pendingRef.current = true;
  setSubmitting(true);
  void promptAsync().catch(() => {
    pendingRef.current = false;
    setSubmitting(false);
    callbacks.onFormError(getCopy().auth.signInFailed);
  });
}
