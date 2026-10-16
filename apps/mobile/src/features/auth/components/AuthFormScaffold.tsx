import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { AuthHeaderMascot } from './AuthHeaderMascot';
import type { AuthMascotTone } from './AuthMascot';
import { AuthModeTabs, type AuthMode } from './AuthModeTabs';

export type AuthFormScaffoldProps = {
  headline: string;
  subtitle: string;
  bubble: string;
  mascotTone: AuthMascotTone;
  onBack: () => void;
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  children: ReactNode;
};

export function AuthFormScaffold({
  headline,
  subtitle,
  bubble,
  mascotTone,
  onBack,
  mode,
  onModeChange,
  children,
}: AuthFormScaffoldProps) {
  const nav = getCopy().nav;

  return (
    <Screen scroll padded edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <StatusBar style="dark" />
      <Header title={nav.appHeader} onBack={onBack} />
      <View style={styles.body}>
        <AuthHeaderMascot tone={mascotTone} bubble={bubble} />
        <View style={styles.heading}>
          <AppText variant="display" color={colors.ink}>
            {headline}
          </AppText>
          <AppText variant="body" color={colors.muteBody}>
            {subtitle}
          </AppText>
        </View>
        {mode && onModeChange ? <AuthModeTabs value={mode} onChange={onModeChange} /> : null}
        <View style={styles.form}>{children}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
  },
  body: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  heading: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
});
