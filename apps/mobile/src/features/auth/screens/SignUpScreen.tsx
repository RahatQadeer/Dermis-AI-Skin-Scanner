import { TextField } from '@/src/components/TextField';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors } from '@/src/theme';

import { AuthDivider } from '../components/AuthDivider';
import { AuthFormScaffold } from '../components/AuthFormScaffold';
import { AuthLegalFooter } from '../components/AuthLegalFooter';
import { AuthPasswordField } from '../components/AuthPasswordField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { useSignUpForm } from '../hooks/useAuthForms';

export function SignUpScreen() {
  const auth = getCopy().auth;
  const form = useSignUpForm();

  return (
    <AuthFormScaffold
      headline={auth.signUpTitle}
      subtitle={auth.signUpSubtitle}
      bubble={auth.signUpBubble}
      mascotTone={form.mascotTone}
      onBack={form.goBack}
      mode="signUp"
      onModeChange={(mode) => {
        if (mode === 'logIn') {
          form.goLogIn();
        }
      }}
    >
      <SignUpFields form={form} />
    </AuthFormScaffold>
  );
}

function SignUpFields({ form }: { form: ReturnType<typeof useSignUpForm> }) {
  const auth = getCopy().auth;
  return (
    <>
      <SocialAuthButtons
        mode="signUp"
        onApple={form.continueApple}
        onGoogle={form.continueGoogle}
        disabled={form.submitting}
      />
      <AuthDivider />
      <TextField
        label={auth.firstNameLabel}
        placeholder={auth.firstNamePlaceholder}
        value={form.firstName}
        onChangeText={form.setFirstName}
        autoCapitalize="words"
        textContentType="givenName"
        error={form.errors.name}
      />
      <TextField
        label={auth.emailLabel}
        placeholder={auth.emailPlaceholder}
        value={form.email}
        onChangeText={form.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
        error={form.errors.email}
      />
      <SignUpPasswordField form={form} />
      {form.formError ? (
        <AppText variant="caption" color={colors.red} accessibilityLiveRegion="polite">
          {form.formError}
        </AppText>
      ) : null}
      <AuthPrimaryButton label={auth.signUpCta} onPress={form.submit} loading={form.submitting} />
      <AuthLegalFooter />
    </>
  );
}

function SignUpPasswordField({ form }: { form: ReturnType<typeof useSignUpForm> }) {
  const auth = getCopy().auth;
  return (
    <AuthPasswordField
      label={auth.passwordLabel}
      placeholder={auth.passwordPlaceholder}
      value={form.password}
      onChangeText={form.setPassword}
      error={form.errors.password}
      showMeter
      hint={auth.passwordHint}
      textContentType="newPassword"
      returnKeyType="go"
      onSubmitEditing={form.submit}
    />
  );
}
