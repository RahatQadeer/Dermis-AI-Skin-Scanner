import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/src/components/layout/Screen';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies } from '@/src/theme';

import { WelcomeCta } from '../components/WelcomeCta';
import { WelcomeHeroBand } from '../components/WelcomeHeroBand';
import { WelcomeStats } from '../components/WelcomeStats';

export function WelcomeScreen() {
  const router = useRouter();
  const w = getCopy().screens.welcome;
  const insets = useSafeAreaInsets();

  return (
    <Screen
      scroll
      padded={false}
      edges={['left', 'right']}
      style={styles.screen}
      contentStyle={styles.content}
    >
      <StatusBar style="dark" />
      <WelcomeHeroBand onLogIn={() => router.push('/log-in')} />
      <View
        style={[
          styles.body,
          /** Prototype cream pad bottom 38; keep home-indicator clearance. */
          { paddingBottom: Math.max(38, 12 + insets.bottom) },
        ]}
      >
        <Text
          style={styles.headline}
          accessibilityRole="header"
          maxFontSizeMultiplier={1}
        >
          {w.headlineKnow}
          {w.headlineMid}
          <Text style={styles.accent}>{w.headlineAccentLead}</Text>
          {'\n'}
          <Text style={styles.accent}>{w.headlineAccentRest}</Text>
        </Text>
        <Text style={styles.subcopy} maxFontSizeMultiplier={1}>
          {w.subcopy}
        </Text>
        <WelcomeStats />
        {/* Prototype `<div style="flex:1"></div>` — pins CTA + footnote to bottom. */}
        <View style={styles.bottomSpacer} />
        <WelcomeCta onPress={() => router.push('/quiz')} />
        <AppText style={styles.footnote}>{w.footnote}</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.cream,
  },
  content: {
    flexGrow: 1,
  },
  /** Prototype: flex column, 24 side/top, CTA pinned below flex spacer. */
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  bottomSpacer: {
    flex: 1,
    minHeight: 18,
  },
  /** One step up from prototype 34 so line 1 fits “Know your skin, one”. */
  headline: {
    marginTop: 8,
    marginBottom: 4,
    fontFamily: fontFamilies.heading,
    fontSize: 36,
    lineHeight: Math.round(36 * 1.05),
    letterSpacing: -0.36,
    color: colors.ink,
  },
  accent: {
    color: colors.pinkAccent,
  },
  /** One step up from prototype 15px. */
  subcopy: {
    marginTop: 10,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: colors.muteBody,
  },
  /** Prototype footnote: 12px under CTA. */
  footnote: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muteFoot,
  },
});
