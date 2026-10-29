import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { AuthMascotTone } from '../components/AuthMascot';
import {
  hasFieldErrors,
  isValidEmail,
  validateForgotEmail,
  type FieldErrors,
} from '../lib/authValidation';
import { resolveAuthFieldErrors } from '../lib/resolveAuthErrors';
import { useGoogleAuth } from './useGoogleAuth';
import { signUpMascotTone, submitLogInRequest, submitSignUpRequest } from './submitAuthForms';

function useAuthFormShell() {
  const session = useSession();
  const auth = getCopy().auth;
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const google = useGoogleAuth({
    session,
    onFormError: setFormError,
    onSubmittingChange: setSubmitting,
  });
  return {
    session,
    auth,
    formError,
    setFormError,
    submitting: submitting || google.googleBusy,
    setSubmitting,
    continueApple: () => setFormError(auth.socialNotAvailable),
    continueGoogle: google.continueGoogle,
  };
}

export function useSignUpForm() {
  const router = useRouter();
  const shell = useAuthFormShell();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const mascotTone = useMemo(
    (): AuthMascotTone =>
      signUpMascotTone({
        errors,
        formError: shell.formError,
        firstName,
        email,
        password,
      }),
    [email, errors, firstName, password, shell.formError],
  );

  const submit = () => {
    shell.setFormError(undefined);
    void (async () => {
      shell.setSubmitting(true);
      const result = await submitSignUpRequest(shell.session, firstName, email, password);
      setErrors(result.errors);
      shell.setFormError(result.formError);
      shell.setSubmitting(false);
    })();
  };

  return {
    firstName,
    setFirstName,
    email,
    setEmail,
    password,
    setPassword,
    errors: resolveAuthFieldErrors(errors),
    formError: shell.formError,
    submitting: shell.submitting,
    mascotTone,
    submit,
    goLogIn: () => router.replace('/log-in'),
    continueApple: shell.continueApple,
    continueGoogle: shell.continueGoogle,
    goBack: () => router.replace('/log-in'),
  };
}

export function useLogInForm() {
  const router = useRouter();
  const shell = useAuthFormShell();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const canSubmit = isValidEmail(email) && password.length > 0;

  const mascotTone = useMemo((): AuthMascotTone => {
    if (hasFieldErrors(errors) || shell.formError) {
      return 'invalid';
    }
    if (email && password) {
      return 'ready';
    }
    return 'idle';
  }, [email, errors, password, shell.formError]);

  const submit = () => {
    shell.setFormError(undefined);
    void (async () => {
      shell.setSubmitting(true);
      const result = await submitLogInRequest(shell.session, email, password);
      setErrors(result.errors);
      shell.setFormError(result.formError);
      shell.setSubmitting(false);
    })();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors: resolveAuthFieldErrors(errors),
    formError: shell.formError,
    submitting: shell.submitting,
    canSubmit,
    mascotTone,
    submit,
    goSignUp: () => router.replace('/sign-up'),
    goForgot: () => router.push('/forgot-password'),
    continueApple: shell.continueApple,
    continueGoogle: shell.continueGoogle,
    goBack: () => {
      if (router.canGoBack()) {
        router.back();
      }
    },
  };
}

export function useForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);

  const mascotTone = useMemo((): AuthMascotTone => {
    if (sent) {
      return 'resetSent';
    }
    if (hasFieldErrors(errors)) {
      return 'invalid';
    }
    if (email) {
      return 'ready';
    }
    return 'idle';
  }, [email, errors, sent]);

  const submit = () => {
    const nextErrors = validateForgotEmail(email);
    setErrors(nextErrors);
    if (!hasFieldErrors(nextErrors)) {
      setSent(true);
    }
  };

  return {
    email,
    setEmail,
    errors: resolveAuthFieldErrors(errors),
    sent,
    mascotTone,
    submit,
    goBack: () => router.back(),
  };
}
