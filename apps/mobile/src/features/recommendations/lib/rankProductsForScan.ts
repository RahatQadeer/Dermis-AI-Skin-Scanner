import { CONCERN_IDS, type ConcernId } from '@dermis/domain';

import type { PlaceholderProduct } from '../types/productTypes';

/** Rank catalog actives by the user's weakest real concern scores (lower = needs more help). */
export function rankProductsForScan(
  products: readonly PlaceholderProduct[],
  concernScores: Record<ConcernId, number>,
  limit = 4,
): PlaceholderProduct[] {
  const weakness = (id: ConcernId) => 100 - (concernScores[id] ?? 50);

  const scored = products.map((product) => {
    const weight = product.concernIds.reduce((sum, id) => sum + weakness(id), 0);
    const primaryScore = concernScores[product.primaryConcern];
    return {
      product: {
        ...product,
        score: primaryScore,
      },
      weight,
    };
  });

  scored.sort((a, b) => b.weight - a.weight);
  return scored.slice(0, limit).map((row) => row.product);
}

export function emptyConcernScores(): Record<ConcernId, number> {
  return CONCERN_IDS.reduce(
    (acc, id) => {
      acc[id] = 0;
      return acc;
    },
    {} as Record<ConcernId, number>,
  );
}
