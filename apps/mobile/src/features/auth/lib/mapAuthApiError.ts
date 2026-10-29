import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import type { FieldErrors } from './authValidation';

export type MappedAuthError = {
  fieldErrors: FieldErrors;
  formError: string;
};

type AuthCopy = ReturnType<typeof getCopy>['auth'];

/** Map backend auth error codes onto fields + a form message. */
export function mapAuthApiError(error: unknown, mode: 'signUp' | 'logIn'): MappedAuthError {
  const auth = getCopy().auth;
  const fallback = mode === 'signUp' ? auth.signUpFailed : auth.signInFailed;
  if (!isApiError(error)) {
    return { fieldErrors: {}, formError: fallback };
  }
  return resolveAuthErrorCode(auth, error.code, fallback);
}

function resolveAuthErrorCode(auth: AuthCopy, code: string, fallback: string): MappedAuthError {
  const fieldMap: Record<string, keyof FieldErrors> = {
    email_taken: 'email',
    invalid_email: 'email',
    weak_password: 'password',
  };
  const messageByCode: Record<string, string> = {
    email_taken: auth.emailTaken,
    invalid_email: auth.emailInvalid,
    weak_password: auth.passwordWeak,
    invalid_credentials: auth.signInFailed,
    auth_nonce_mismatch: auth.appleSignInFailed,
    auth_provider_error: auth.authProviderError,
    email_confirmation_required: auth.emailConfirmationRequired,
    rate_limited: auth.rateLimited,
  };
  const formError = messageByCode[code] ?? fallback;
  const field = fieldMap[code];
  const fieldKey =
    field === 'email'
      ? code === 'email_taken'
        ? 'emailTaken'
        : 'emailInvalid'
      : field === 'password'
        ? 'passwordWeak'
        : undefined;
  return {
    fieldErrors: field && fieldKey ? { [field]: fieldKey } : {},
    formError,
  };
}
