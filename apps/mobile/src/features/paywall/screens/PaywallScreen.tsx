import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { spacing } from '@/src/theme';

import { PaywallScreenBottom } from '../components/PaywallScreenBottom';
import {
  PaywallFeatureList,
  PaywallHero,
  PaywallProjectedIndex,
  PaywallTierCards,
  PaywallTopBar,
} from '../components/PaywallDarkSections';
import { paywallDark } from '../paywallDark';
import { usePaywallSelection } from '../hooks/usePaywallSelection';
import { useSession } from '@/src/features/session/SessionContext';

export function PaywallScreen() {
  const router = useRouter();
  const session = useSession();
  const flow = usePaywallSelection();

  const { postAuthPaywall, consumePostAuthPaywall } = session;
  useEffect(() => {
    if (postAuthPaywall) {
      consumePostAuthPaywall();
    }
  }, [postAuthPaywall, consumePostAuthPaywall]);

  const onClose = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home');
  };

  return (
    <Screen
      scroll
      edges={['top', 'left', 'right', 'bottom']}
      style={styles.screen}
      contentStyle={styles.content}
    >
      <StatusBar style="light" />
      <PaywallTopBar onClose={onClose} />
      <PaywallHero />
      <PaywallProjectedIndex />
      <PaywallTierCards />
      <PaywallFeatureList />
      <PaywallScreenBottom flow={flow} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: paywallDark.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
