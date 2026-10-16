import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useScanNavigation } from '@/src/features/consent/hooks/useScanNavigation';
import { colors, spacing } from '@/src/theme';

import { ProductCard } from '../components/ProductCard';
import { RecommendationsIntro } from '../components/RecommendationsIntro';
import { useRecommendations } from '../hooks/useRecommendations';

export function RecommendationsScreen() {
  const router = useRouter();
  const r = getCopy().screens.recommendations;
  const { goScan } = useScanNavigation();
  const { loading, hasScan, products } = useRecommendations();

  return (
    <Screen scroll padded edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <Header
        title={r.title}
        onBack={router.canGoBack() ? () => router.back() : () => router.replace('/home')}
      />
      {loading ? (
        <View style={styles.loader} accessibilityLabel={r.loadingA11y}>
          <ActivityIndicator color={colors.pinkBright} size="large" />
        </View>
      ) : !hasScan ? (
        <EmptyState
          title={r.emptyScanTitle}
          body={r.emptyScanBody}
          actionLabel={r.emptyScanCta}
          onAction={goScan}
        />
      ) : (
        <>
          <RecommendationsIntro />
          <View style={styles.list}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </View>
          <View style={styles.footer}>
            <AppText variant="caption" color={colors.mute} style={styles.footerText}>
              {r.footnote}
            </AppText>
            <AppText variant="caption" color={colors.muteFoot} style={styles.footerText}>
              {getCopy().compliance.healthDeclaration}
            </AppText>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
  list: {
    gap: spacing.md,
  },
  loader: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  footerText: {
    textAlign: 'justify',
    lineHeight: 20,
  },
});
