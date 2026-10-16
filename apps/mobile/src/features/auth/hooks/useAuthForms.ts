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
import {
  signUpMascotTone,
  submitLogInRequest,
  submitSignUpRequest,
} from './submitAuthForms';

export function useSignUpForm() {
  const router = useRouter();
  const session = useSession();
  const auth = getCopy().auth;
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const mascotTone = useMemo(
    (): AuthMascotTone =>
      signUpMascotTone({ errors, formError, firstName, email, password }),
    [email, errors, firstName, formError, password],
  );

  const submit = () => {
    setFormError(undefined);
    void (async () => {
      setSubmitting(true);
      const result = await submitSignUpRequest(session, firstName, email, password);
      setErrors(result.errors);
      setFormError(result.formError);
      setSubmitting(false);
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
    formError,
    submitting,
    mascotTone,
    submit,
    goLogIn: () => router.replace('/log-in'),
    continueSocial: () => setFormError(auth.socialNotAvailable),
    goBack: () => router.replace('/log-in'),
  };
}

export function useLogInForm() {
  const router = useRouter();
  const session = useSession();
  const auth = getCopy().auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = isValidEmail(email) && password.length > 0;

  const mascotTone = useMemo((): AuthMascotTone => {
    if (hasFieldErrors(errors) || formError) {
      return 'invalid';
    }
    if (email && password) {
      return 'ready';
    }
    return 'idle';
  }, [email, errors, formError, password]);

  const submit = () => {
    setFormError(undefined);
    void (async () => {
      setSubmitting(true);
      const result = await submitLogInRequest(session, email, password);
      setErrors(result.errors);
      setFormError(result.formError);
      setSubmitting(false);
    })();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors: resolveAuthFieldErrors(errors),
    formError,
    submitting,
    canSubmit,
    mascotTone,
    submit,
    goSignUp: () => router.replace('/sign-up'),
    goForgot: () => router.push('/forgot-password'),
    continueSocial: () => setFormError(auth.socialNotAvailable),
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
