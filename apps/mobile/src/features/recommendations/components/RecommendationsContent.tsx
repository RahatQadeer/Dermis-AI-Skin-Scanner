import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { EmptyState } from '@/src/components/EmptyState';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import type { useAddActiveToRoutine } from '../hooks/useAddActiveToRoutine';
import type { PlaceholderProduct } from '../types/productTypes';
import { ProductCard } from './ProductCard';
import { RecommendationsIntro } from './RecommendationsIntro';

type RecommendationsContentProps = {
  loading: boolean;
  hasScan: boolean;
  products: PlaceholderProduct[];
  fromRoutine: boolean;
  add: ReturnType<typeof useAddActiveToRoutine>;
  onScan: () => void;
};

function addingPeriodFor(busyId: string | null, productId: string): 'am' | 'pm' | null {
  return busyId?.startsWith(`${productId}:`) ? (busyId.split(':')[1] as 'am' | 'pm') : null;
}

function RecommendationsList({
  products,
  fromRoutine,
  add,
}: Pick<RecommendationsContentProps, 'products' | 'fromRoutine' | 'add'>) {
  return (
    <View style={styles.list}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onAddToRoutine={
            fromRoutine && add.live
              ? (period) => void add.addActive(product.id, product.name, period)
              : undefined
          }
          addingPeriod={addingPeriodFor(add.busyId, product.id)}
        />
      ))}
    </View>
  );
}

export function RecommendationsContent({
  loading,
  hasScan,
  products,
  fromRoutine,
  add,
  onScan,
}: RecommendationsContentProps) {
  const router = useRouter();
  const r = getCopy().screens.recommendations;

  if (loading) {
    return (
      <View style={styles.loader} accessibilityLabel={r.loadingA11y}>
        <ActivityIndicator color={colors.pinkBright} size="large" />
      </View>
    );
  }
  if (!hasScan) {
    return (
      <EmptyState
        title={r.emptyScanTitle}
        body={r.emptyScanBody}
        actionLabel={r.emptyScanCta}
        onAction={onScan}
      />
    );
  }
  return (
    <>
      <RecommendationsIntro fromRoutine={fromRoutine} />
      <RecommendationsList products={products} fromRoutine={fromRoutine} add={add} />
      {fromRoutine ? (
        <Button
          label={r.backToRoutine}
          variant="outline"
          onPress={() => router.replace('/routine')}
        />
      ) : null}
      <AppText variant="caption" color={colors.mute} align="center">
        {r.footnote}
      </AppText>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  loader: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
