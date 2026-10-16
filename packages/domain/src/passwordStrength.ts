export type PasswordCheck = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

export type PasswordStrengthLabel = 'weak' | 'fair' | 'good' | 'strong';

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
  checks: PasswordCheck;
};

/** Minimum length — shared by client meter and server validation. */
export const PASSWORD_MIN_LENGTH = 8;

function countPassed(checks: PasswordCheck): number {
  return Object.values(checks).filter(Boolean).length;
}

function labelForScore(score: 0 | 1 | 2 | 3 | 4): PasswordStrengthLabel {
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
}

/**
 * Password strength for sign-up UI and server validation helpers.
 * Score 0–4 from five checks (length, upper, lower, number, symbol).
 * Acceptable passwords require length + upper + lower + number only (symbol optional).
 */
export function passwordStrength(password: string): PasswordStrength {
  const checks: PasswordCheck = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const passed = countPassed(checks);
  const score = Math.min(4, passed) as 0 | 1 | 2 | 3 | 4;

  return {
    score,
    label: labelForScore(score),
    checks,
  };
}

export function isPasswordAcceptable(password: string): boolean {
  const { checks } = passwordStrength(password);
  return checks.minLength && checks.upper && checks.lower && checks.number;
}
