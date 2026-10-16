import { CONCERN_IDS, type ConcernId } from '@dermis/domain';

import { listScans, type ScanDto } from '@/src/features/scan/api/scanApi';

import { PLACEHOLDER_PRODUCTS } from '../mock/placeholderProducts';
import { rankProductsForScan } from '../lib/rankProductsForScan';
import type { PlaceholderProduct } from '../types/productTypes';

function concernsFromScan(scan: ScanDto): Record<ConcernId, number> {
  return CONCERN_IDS.reduce(
    (acc, id) => {
      acc[id] = scan.concerns[id];
      return acc;
    },
    {} as Record<ConcernId, number>,
  );
}

export async function loadRecommendationProducts(
  live: boolean,
  lastScan: ScanDto | null,
): Promise<{ hasScan: boolean; products: PlaceholderProduct[] }> {
  let scan: ScanDto | null = lastScan;
  if (live) {
    const rows = await listScans();
    scan = rows[0] ?? lastScan;
  }
  if (!scan) {
    return { hasScan: false, products: [] };
  }
  return {
    hasScan: true,
    products: rankProductsForScan(PLACEHOLDER_PRODUCTS, concernsFromScan(scan), 4),
  };
}
