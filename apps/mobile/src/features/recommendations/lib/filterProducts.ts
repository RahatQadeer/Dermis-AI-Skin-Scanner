import type { ConcernId } from '@dermis/domain';

import type { PlaceholderProduct } from '../types/productTypes';

export type ConcernFilter = 'all' | ConcernId;

export function filterProducts(
  products: readonly PlaceholderProduct[],
  filter: ConcernFilter,
): PlaceholderProduct[] {
  if (filter === 'all') {
    return [...products];
  }
  return products.filter((product) => product.concernIds.includes(filter));
}
