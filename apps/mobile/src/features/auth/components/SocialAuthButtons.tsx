import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import { AppleIcon, GoogleIcon } from './BrandIcons';
import type { AuthMode } from './AuthModeTabs';

export type SocialAuthButtonsProps = {
  mode: AuthMode;
  onApple: () => void;
  onGoogle: () => void;
};

export function SocialAuthButtons({ mode, onApple, onGoogle }: SocialAuthButtonsProps) {
  const auth = getCopy().auth;
  const appleLabel = mode === 'signUp' ? auth.signUpApple : auth.logInApple;
  const googleLabel = mode === 'signUp' ? auth.signUpGoogle : auth.logInGoogle;

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'ios' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={appleLabel}
          onPress={onApple}
          style={(state) => [styles.button, styles.apple, state.pressed ? styles.pressed : null]}
        >
          <AppleIcon size={18} color={colors.surface} />
          <AppText variant="bodyStrong" color={colors.surface}>
            {appleLabel}
          </AppText>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={googleLabel}
        onPress={onGoogle}
        style={(state) => [styles.button, styles.google, state.pressed ? styles.pressed : null]}
      >
        <GoogleIcon size={18} />
        <AppText variant="bodyStrong" color={colors.ink}>
          {googleLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: spacing.huge,
    borderRadius: radii.pill,
  },
  apple: {
    backgroundColor: colors.ink,
  },
  google: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
});
