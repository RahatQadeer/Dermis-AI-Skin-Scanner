import { getCopy } from '@/src/copy';

import { AuthFormScaffold } from '../components/AuthFormScaffold';
import { useLogInForm } from '../hooks/useAuthForms';
import { LogInFields } from './LogInFields';

export function LogInScreen() {
  const auth = getCopy().auth;
  const form = useLogInForm();

  return (
    <AuthFormScaffold
      headline={auth.logInTitle}
      subtitle={auth.logInSubtitle}
      bubble={auth.logInBubble}
      mascotTone={form.mascotTone}
      onBack={form.goBack}
      mode="logIn"
      onModeChange={(mode) => {
        if (mode === 'signUp') {
          form.goSignUp();
        }
      }}
    >
      <LogInFields form={form} />
    </AuthFormScaffold>
  );
}
