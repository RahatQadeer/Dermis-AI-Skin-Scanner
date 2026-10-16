import { isPasswordAcceptable } from '@dermis/domain';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthFieldKey = 'name' | 'email' | 'password';

export type AuthErrorCode =
  | 'nameRequired'
  | 'emailInvalid'
  | 'emailTaken'
  | 'passwordWeak'
  | 'passwordTooShort';

export type FieldErrors = Partial<Record<AuthFieldKey, AuthErrorCode>>;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateSignUpFields(
  firstName: string,
  email: string,
  password: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (firstName.trim().length === 0) {
    errors.name = 'nameRequired';
  }
  if (!isValidEmail(email)) {
    errors.email = 'emailInvalid';
  }
  if (!isPasswordAcceptable(password)) {
    errors.password = 'passwordWeak';
  }

  return errors;
}

export function validateLogInFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!isValidEmail(email)) {
    errors.email = 'emailInvalid';
  }
  if (password.length < 1) {
    errors.password = 'passwordTooShort';
  }

  return errors;
}

export function validateForgotEmail(email: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!isValidEmail(email)) {
    errors.email = 'emailInvalid';
  }
  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
