import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

import { WelcomeBrandMark } from './WelcomeBrandMark';

export type WelcomeHeaderProps = {
  onLogIn: () => void;
};

/** Prototype header: brand left, Log in pill 34px tall / Nunito 700 13. */
export function WelcomeHeader({ onLogIn }: WelcomeHeaderProps) {
  const label = getCopy().screens.welcome.logInPill;

  return (
    <View style={styles.row}>
      <WelcomeBrandMark />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onLogIn}
        hitSlop={10}
        style={({ pressed }) => [styles.pill, pressed ? styles.pressed : null]}
      >
        <AppText style={styles.pillLabel} color={colors.ink}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    height: 34,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 13,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
