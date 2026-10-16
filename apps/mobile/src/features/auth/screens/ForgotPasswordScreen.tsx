import { StyleSheet, View } from 'react-native';

import { TextField } from '@/src/components/TextField';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { AuthFormScaffold } from '../components/AuthFormScaffold';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { useForgotPasswordForm } from '../hooks/useAuthForms';

export function ForgotPasswordScreen() {
  const auth = getCopy().auth;
  const common = getCopy().common;
  const form = useForgotPasswordForm();

  return (
    <AuthFormScaffold
      headline={auth.forgotTitle}
      subtitle={auth.forgotSubtitle}
      bubble={auth.forgotBubble}
      mascotTone={form.mascotTone}
      onBack={form.goBack}
    >
      <View style={styles.form}>
        <TextField
          label={auth.emailLabel}
          placeholder={auth.emailPlaceholder}
          value={form.email}
          onChangeText={form.setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          error={form.errors.email}
          editable={!form.sent}
        />
        {form.sent ? (
          <AppText variant="body" color={colors.mute}>
            {auth.resetSent}
          </AppText>
        ) : null}
        <AuthPrimaryButton
          label={form.sent ? common.back : auth.forgotCta}
          onPress={form.sent ? form.goBack : form.submit}
        />
      </View>
    </AuthFormScaffold>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
