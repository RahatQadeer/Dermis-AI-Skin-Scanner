import { getCopy } from '@/src/copy';

import type { AuthErrorCode, FieldErrors } from '../lib/authValidation';

export function resolveAuthFieldErrors(errors: FieldErrors): Record<string, string | undefined> {
  const auth = getCopy().auth;
  const map: Record<AuthErrorCode, string> = {
    nameRequired: auth.nameRequired,
    emailInvalid: auth.emailInvalid,
    emailTaken: auth.emailTaken,
    passwordTooShort: auth.passwordTooShort,
    passwordWeak: auth.passwordWeak,
  };

  return {
    name: errors.name ? map[errors.name] : undefined,
    email: errors.email ? map[errors.email] : undefined,
    password: errors.password ? map[errors.password] : undefined,
  };
}
