import { isUnlockAllFeatures } from '@dermis/domain';

import { getCopy } from '@/src/copy';
import type { SessionState } from '@/src/features/session/SessionContext';

import { signInWithPassword, signUpWithPassword } from '../api/authApi';
import type { AuthMascotTone } from '../components/AuthMascot';
import {
  hasFieldErrors,
  validateLogInFields,
  validateSignUpFields,
  type FieldErrors,
} from '../lib/authValidation';
import { mapAuthApiError } from '../lib/mapAuthApiError';

type SubmitResult = {
  errors: FieldErrors;
  formError?: string;
};

export function signUpMascotTone(fields: {
  errors: FieldErrors;
  formError: string | undefined;
  firstName: string;
  email: string;
  password: string;
}): AuthMascotTone {
  if (hasFieldErrors(fields.errors) || fields.formError) {
    return 'invalid';
  }
  if (fields.firstName && fields.email && fields.password) {
    return 'ready';
  }
  return 'idle';
}

export async function submitSignUpRequest(
  session: SessionState,
  firstName: string,
  email: string,
  password: string,
): Promise<SubmitResult> {
  const nextErrors = validateSignUpFields(firstName, email, password);
  if (hasFieldErrors(nextErrors)) {
    return { errors: nextErrors };
  }
  if (!session.apiEnabled) {
    return { errors: {}, formError: getCopy().auth.apiNotConfigured };
  }
  try {
    const authSession = await signUpWithPassword({ firstName, email, password });
    session.applyServerSession({
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      email: authSession.user.email ?? email,
      userId: authSession.user.id,
      firstName: authSession.user.firstName ?? firstName.trim(),
      showPaywall: session.onboardingComplete && !isUnlockAllFeatures(),
    });
    return { errors: {} };
  } catch (error) {
    const mapped = mapAuthApiError(error, 'signUp');
    return { errors: mapped.fieldErrors, formError: mapped.formError };
  }
}

export async function submitLogInRequest(
  session: SessionState,
  email: string,
  password: string,
): Promise<SubmitResult> {
  const nextErrors = validateLogInFields(email, password);
  if (hasFieldErrors(nextErrors)) {
    return { errors: nextErrors };
  }
  if (!session.apiEnabled) {
    return { errors: {}, formError: getCopy().auth.apiNotConfigured };
  }
  try {
    const authSession = await signInWithPassword({ email, password });
    session.applyServerSession({
      accessToken: authSession.accessToken,
      refreshToken: authSession.refreshToken,
      email: authSession.user.email ?? email,
      userId: authSession.user.id,
      firstName: authSession.user.firstName,
      showPaywall: session.onboardingComplete && !isUnlockAllFeatures(),
    });
    return { errors: {} };
  } catch (error) {
    const mapped = mapAuthApiError(error, 'logIn');
    return { errors: mapped.fieldErrors, formError: mapped.formError };
  }
}
