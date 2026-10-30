import { Pressable, StyleSheet } from 'react-native';

import { TextField } from '@/src/components/TextField';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { AuthDivider } from '../components/AuthDivider';
import { AuthPasswordField } from '../components/AuthPasswordField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import type { useLogInForm } from '../hooks/useAuthForms';

type LogInForm = ReturnType<typeof useLogInForm>;

function LogInFooter({
  form,
  auth,
}: {
  form: LogInForm;
  auth: ReturnType<typeof getCopy>['auth'];
}) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={auth.forgotLink}
        onPress={form.goForgot}
        style={styles.forgot}
        hitSlop={spacing.sm}
      >
        <AppText variant="bodyStrong" color={colors.pink}>
          {auth.forgotLink}
        </AppText>
      </Pressable>
      {form.formError ? (
        <AppText variant="caption" color={colors.red} accessibilityLiveRegion="polite">
          {form.formError}
        </AppText>
      ) : null}
      <AuthPrimaryButton
        label={auth.logInCta}
        onPress={form.submit}
        disabled={!form.canSubmit}
        loading={form.submitting}
      />
      <AppText variant="caption" color={colors.muteFoot} align="center">
        {auth.logInFootnote}
      </AppText>
    </>
  );
}

export function LogInFields({ form }: { form: LogInForm }) {
  const auth = getCopy().auth;
  return (
    <>
      <SocialAuthButtons
        mode="logIn"
        onApple={form.continueApple}
        onGoogle={form.continueGoogle}
        disabled={form.submitting}
      />
      <AuthDivider />
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
      <AuthPasswordField
        label={auth.passwordLabel}
        placeholder={auth.passwordPlaceholder}
        value={form.password}
        onChangeText={form.setPassword}
        error={form.errors.password}
      />
      <LogInFooter form={form} auth={auth} />
    </>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
  },
});
