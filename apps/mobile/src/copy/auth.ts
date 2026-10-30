import { commonCopy } from './common';
import { paywallCopy } from './paywall';

/** Auth validation and UI copy (DERM-024). */
export const authCopy = {
  // Validation messages
  nameRequired: 'Enter your first name.',
  emailInvalid: 'Enter a valid email address.',
  passwordTooShort: 'Password must be at least 8 characters.',
  passwordWeak: 'Use 8+ characters with upper, lower and a number.',
  passwordsMismatch: 'Passwords do not match.',
  signInFailed: 'Could not sign in. Check your details and try again.',
  signUpFailed: 'Could not create your account. Try again.',
  emailTaken: 'That email already has an account. Try logging in.',
  emailConfirmationRequired: 'Confirm your email, then log in.',
  rateLimited: 'Too many attempts. Wait a moment and try again.',
  authProviderError: 'Sign-in could not be completed. Try again, or use email.',
  appleSignInFailed:
    'Apple Sign-In could not be completed. Confirm Apple is enabled for this app, then try again.',
  apiNotConfigured:
    'Cannot reach the server. Confirm EXPO_PUBLIC_API_URL and that the backend is running.',
  socialNotAvailable:
    'Google Sign-In needs OAuth client IDs in this build. For now, create or log in with email — Pro features are unlocked for testing.',
  appleUnavailable: 'Sign in with Apple is not available on this device.',
  googleNeedsDevBuild:
    'Google Sign-In needs a development or preview build (not Expo Go). Install the EAS preview IPA, or use email for now.',
  resetSent:
    'If an account uses that email, a reset link is on its way. Open it on this phone, set a new password, then log in.',
  resetFailed: "We couldn't send the reset email. Check your connection and try again.",

  // Headlines + subcopy
  signUpTitle: 'Save your skin profile',
  signUpSubtitle:
    'Create an account so your scans and routine sync across devices. Your first scan is free.',
  logInTitle: 'Welcome back',
  logInSubtitle: "Log in to see your scan history and today's routine.",
  forgotTitle: 'Reset your password',
  forgotSubtitle: "Enter your email and we'll send reset instructions.",

  // Mode tabs
  modeSignUp: commonCopy.signUp,
  modeLogIn: commonCopy.logIn,

  // Social
  signUpApple: 'Sign up with Apple',
  signUpGoogle: 'Sign up with Google',
  logInApple: 'Continue with Apple',
  logInGoogle: 'Continue with Google',
  orEmailDivider: 'or with email',

  // Fields
  firstNameLabel: 'Full name',
  firstNamePlaceholder: 'Rahat Kadir',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'At least 8 characters',
  // Must match isPasswordAcceptable (@dermis/domain): symbol is optional.
  passwordHint: '8+ characters with upper- and lowercase letters and a number',
  confirmPasswordLabel: 'Confirm password',

  // CTAs + prompts
  signUpCta: 'Create account',
  logInCta: commonCopy.logIn,
  forgotCta: 'Send reset link',
  forgotLink: 'Forgot password?',
  logInFootnote: 'New to Dermis? Tap Sign up above.',
  signUpFootnote: 'Already have an account? Tap Log in above.',
  hasAccountPrompt: 'Already have an account?',
  noAccountPrompt: 'New to Dermis?',

  // Mascot speech bubbles (idle)
  signUpBubble: 'Save your profile so I remember your skin.',
  logInBubble: 'Welcome back! I missed you.',
  forgotBubble: "No worries — let's get you back in.",

  // Legal
  legalLead: 'By continuing you agree to our',
  termsLink: paywallCopy.terms,
  privacyLink: paywallCopy.privacy,
  and: 'and',

  // Mascot reactions
  mascotIdle: 'Baa! We keep your account details secure on our servers.',
  mascotInvalid: 'Hmm — check the highlighted fields.',
  mascotReady: 'Ready when you are!',
  mascotResetSent: 'Check your inbox if that email is registered.',
} as const;
