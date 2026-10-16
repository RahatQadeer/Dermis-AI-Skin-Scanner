import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import type { FieldErrors } from './authValidation';

export type MappedAuthError = {
  fieldErrors: FieldErrors;
  formError: string;
};

/** Map backend auth error codes onto fields + a form message. */
export function mapAuthApiError(error: unknown, mode: 'signUp' | 'logIn'): MappedAuthError {
  const auth = getCopy().auth;
  const fallback = mode === 'signUp' ? auth.signUpFailed : auth.signInFailed;
  if (!isApiError(error)) {
    return { fieldErrors: {}, formError: fallback };
  }

  switch (error.code) {
    case 'email_taken':
      return { fieldErrors: { email: 'emailTaken' }, formError: auth.emailTaken };
    case 'invalid_email':
      return { fieldErrors: { email: 'emailInvalid' }, formError: auth.emailInvalid };
    case 'weak_password':
      return { fieldErrors: { password: 'passwordWeak' }, formError: auth.passwordWeak };
    case 'invalid_credentials':
      return { fieldErrors: {}, formError: auth.signInFailed };
    case 'email_confirmation_required':
      return { fieldErrors: {}, formError: auth.emailConfirmationRequired };
    case 'rate_limited':
      return { fieldErrors: {}, formError: auth.rateLimited };
    default:
      return { fieldErrors: {}, formError: fallback };
  }
}
