import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import { colors, radii, spacing } from '@/src/theme';

import type { PlaceholderProduct } from '../types/productTypes';

const IMAGE_TINTS = [colors.noteSoft, colors.greenSoft, colors.amberSoft, colors.confettiSky];

export type ProductCardProps = {
  product: PlaceholderProduct;
  index: number;
};

export const ProductCard = memo(function ProductCard({ product, index }: ProductCardProps) {
  const r = getCopy().screens.recommendations;
  const tint = IMAGE_TINTS[index % IMAGE_TINTS.length];
  const chipLabel =
    product.badgeLabel ?? `${concernLabel(product.primaryConcern)} ${String(product.score)}`;

  return (
    <Card accessibilityRole="summary">
      <View style={styles.row}>
        <View style={[styles.image, { backgroundColor: tint }]}>
          <AppText variant="caption" color={colors.mute} align="center">
            {r.productImageLabel}
          </AppText>
        </View>
        <View style={styles.body}>
          <AppText variant="caption" color={colors.mute}>
            {product.category}
          </AppText>
          <AppText variant="bodyStrong" color={colors.ink}>
            {product.name}
          </AppText>
          <AppText variant="body" color={colors.mute}>
            {product.summary}
          </AppText>
          <View style={styles.footer}>
            <View style={styles.chip}>
              <AppText variant="caption" color={colors.greenDeep}>
                {chipLabel}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
