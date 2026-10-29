import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import { AppleIcon, GoogleIcon } from './BrandIcons';
import type { AuthMode } from './AuthModeTabs';

export type SocialAuthButtonsProps = {
  mode: AuthMode;
  onApple: () => void;
  onGoogle: () => void;
  disabled?: boolean;
};

export function SocialAuthButtons({
  mode,
  onApple,
  onGoogle,
  disabled = false,
}: SocialAuthButtonsProps) {
  const auth = getCopy().auth;
  const appleLabel = mode === 'signUp' ? auth.signUpApple : auth.logInApple;
  const googleLabel = mode === 'signUp' ? auth.signUpGoogle : auth.logInGoogle;

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'ios' ? (
        <SocialPressable
          label={appleLabel}
          disabled={disabled}
          onPress={onApple}
          tone="apple"
          icon={<AppleIcon size={18} color={colors.surface} />}
          labelColor={colors.surface}
        />
      ) : null}
      <SocialPressable
        label={googleLabel}
        disabled={disabled}
        onPress={onGoogle}
        tone="google"
        icon={<GoogleIcon size={18} />}
        labelColor={colors.ink}
      />
    </View>
  );
}

function SocialPressable({
  label,
  disabled,
  onPress,
  tone,
  icon,
  labelColor,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  tone: 'apple' | 'google';
  icon: ReactNode;
  labelColor: string;
}) {
  const toneStyle: StyleProp<ViewStyle> = tone === 'apple' ? styles.apple : styles.google;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={(state) => [
        styles.button,
        toneStyle,
        state.pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      {icon}
      <AppText variant="bodyStrong" color={labelColor}>
        {label}
      </AppText>
    </Pressable>
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
  disabled: {
    opacity: 0.55,
  },
});
