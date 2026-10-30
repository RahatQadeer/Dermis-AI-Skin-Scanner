import { isFeaturesUnlocked } from '@dermis/domain';

import type { SessionState } from '@/src/features/session/SessionContext';
import { isApiError } from '@/src/lib/api/errors';

import { signInWithAppleIdToken } from '../api/authApi';
import { mapAuthApiError } from '../lib/mapAuthApiError';

export type AppleAuthCallbacks = {
  session: SessionState;
  onFormError: (message: string) => void;
  onSubmittingChange?: (submitting: boolean) => void;
};

export async function completeAppleSignIn(
  callbacks: AppleAuthCallbacks,
  input: { idToken: string; nonce: string; firstName?: string },
  done: () => void,
): Promise<void> {
  try {
    const authSession = await signInWithAppleIdToken(input);
    callbacks.session.applyServerSession({
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      email: authSession.user.email ?? '',
      userId: authSession.user.id,
      firstName: authSession.user.firstName,
      showPaywall: callbacks.session.onboardingComplete && !isFeaturesUnlocked(),
    });
  } catch (error) {
    const mapped = mapAuthApiError(error, 'logIn');
    if (isApiError(error)) {
      console.warn('[auth/apple] exchange failed', error.status, error.code);
    }
    callbacks.onFormError(mapped.formError);
  } finally {
    done();
  }
}
