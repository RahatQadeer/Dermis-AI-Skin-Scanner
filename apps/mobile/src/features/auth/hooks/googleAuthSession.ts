import { isUnlockAllFeatures } from '@dermis/domain';

import { getCopy } from '@/src/copy';
import type { SessionState } from '@/src/features/session/SessionContext';

import { signInWithGoogleIdToken } from '../api/authApi';
import { mapAuthApiError } from '../lib/mapAuthApiError';

export type GoogleAuthCallbacks = {
  session: SessionState;
  onFormError: (message: string) => void;
  onSubmittingChange?: (submitting: boolean) => void;
};

export async function completeGoogleSignIn(
  callbacks: GoogleAuthCallbacks,
  idToken: string,
  done: () => void,
): Promise<void> {
  try {
    const authSession = await signInWithGoogleIdToken(idToken);
    callbacks.session.applyServerSession({
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      email: authSession.user.email ?? '',
      userId: authSession.user.id,
      firstName: authSession.user.firstName,
      showPaywall: callbacks.session.onboardingComplete && !isUnlockAllFeatures(),
    });
  } catch (error) {
    const mapped = mapAuthApiError(error, 'logIn');
    callbacks.onFormError(mapped.formError);
  } finally {
    done();
  }
}

export function handleGoogleAuthResponse(input: {
  response: { type: string; params?: { id_token?: string } } | null;
  pendingRef: { current: boolean };
  setSubmitting: (value: boolean) => void;
  callbacks: GoogleAuthCallbacks;
}): void {
  const { response, pendingRef, setSubmitting, callbacks } = input;
  if (!pendingRef.current || !response) {
    return;
  }
  if (response.type === 'dismiss' || response.type === 'cancel') {
    pendingRef.current = false;
    setSubmitting(false);
    return;
  }
  if (response.type !== 'success') {
    return;
  }
  const idToken = response.params?.id_token;
  if (typeof idToken !== 'string' || !idToken.trim()) {
    pendingRef.current = false;
    setSubmitting(false);
    callbacks.onFormError(getCopy().auth.signInFailed);
    return;
  }
  void completeGoogleSignIn(callbacks, idToken, () => {
    pendingRef.current = false;
    setSubmitting(false);
  });
}
