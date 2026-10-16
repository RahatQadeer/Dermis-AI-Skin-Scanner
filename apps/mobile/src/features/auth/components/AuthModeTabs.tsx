import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, shadows, spacing } from '@/src/theme';

export type AuthMode = 'signUp' | 'logIn';

export type AuthModeTabsProps = {
  value: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export function AuthModeTabs({ value, onChange }: AuthModeTabsProps) {
  const auth = getCopy().auth;
  const tabs: { value: AuthMode; label: string }[] = [
    { value: 'signUp', label: auth.modeSignUp },
    { value: 'logIn', label: auth.modeLogIn },
  ];

  return (
    <View style={styles.track} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.value)}
            style={[styles.tab, selected ? styles.tabSelected : null]}
          >
            <AppText
              variant="bodyStrong"
              align="center"
              color={selected ? colors.ink : colors.mute}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.quizContinueDisabled,
    borderRadius: radii.pill,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: spacing.xxl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  tabSelected: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
});
