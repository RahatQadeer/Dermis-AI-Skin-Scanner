import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import type { RoutinePeriod } from '@/src/features/routine/types/routineTypes';
import { colors, radii, spacing, touchTargets } from '@/src/theme';

import type { PlaceholderProduct } from '../types/productTypes';
import { ProductThumb } from './ProductThumb';

export type ProductCardProps = {
  product: PlaceholderProduct;
  index: number;
  /** When set, shows AM/PM add actions (Routine → recommendations). */
  onAddToRoutine?: (period: RoutinePeriod) => void;
  addingPeriod?: RoutinePeriod | null;
};

export const ProductCard = memo(function ProductCard({
  product,
  onAddToRoutine,
  addingPeriod = null,
}: ProductCardProps) {
  const chipLabel =
    product.badgeLabel ?? `${concernLabel(product.primaryConcern)} ${String(product.score)}`;

  return (
    <Card accessibilityRole="summary">
      <View style={styles.row}>
        <ProductThumb productId={product.id} />
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
          <View style={styles.chip}>
            <AppText variant="caption" color={colors.greenDeep}>
              {chipLabel}
            </AppText>
          </View>
          {onAddToRoutine ? (
            <ProductAddActions onAdd={onAddToRoutine} addingPeriod={addingPeriod} />
          ) : null}
        </View>
      </View>
    </Card>
  );
});

function ProductAddActions({
  onAdd,
  addingPeriod,
}: {
  onAdd: (period: RoutinePeriod) => void;
  addingPeriod: RoutinePeriod | null;
}) {
  const routine = getCopy().screens.routine;
  const busy = addingPeriod !== null;
  return (
    <View style={styles.actions}>
      <AddChip
        label={busy && addingPeriod === 'am' ? routine.addActiveBusy : routine.addActiveToAm}
        disabled={busy}
        onPress={() => onAdd('am')}
      />
      <AddChip
        label={busy && addingPeriod === 'pm' ? routine.addActiveBusy : routine.addActiveToPm}
        disabled={busy}
        onPress={() => onAdd('pm')}
      />
    </View>
  );
}

function AddChip({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.addChip, (pressed || disabled) && styles.addPressed]}
    >
      <AppText variant="caption" color={colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addChip: {
    minHeight: touchTargets.min - 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
  },
  addPressed: {
    opacity: 0.7,
  },
});
