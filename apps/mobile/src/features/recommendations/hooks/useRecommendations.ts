import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useScanCapture } from '@/src/features/scan/context/ScanCaptureContext';
import { useSession } from '@/src/features/session/SessionContext';

import { loadRecommendationProducts } from './loadRecommendations';
import type { PlaceholderProduct } from '../types/productTypes';

export type RecommendationsState = {
  loading: boolean;
  hasScan: boolean;
  products: PlaceholderProduct[];
};

/** Ingredient ideas ranked from the user's latest real Gemini scan scores. */
export function useRecommendations(): RecommendationsState {
  const session = useSession();
  const { lastScan } = useScanCapture();
  const [loading, setLoading] = useState(true);
  const [hasScan, setHasScan] = useState(false);
  const [products, setProducts] = useState<PlaceholderProduct[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const live = session.apiEnabled && Boolean(session.accessToken);

      void (async () => {
        setLoading(true);
        try {
          const next = await loadRecommendationProducts(live, lastScan);
          if (cancelled) {
            return;
          }
          setHasScan(next.hasScan);
          setProducts(next.products);
        } catch {
          if (!cancelled && lastScan) {
            const fallback = await loadRecommendationProducts(false, lastScan);
            setHasScan(fallback.hasScan);
            setProducts(fallback.products);
          } else if (!cancelled) {
            setHasScan(false);
            setProducts([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [lastScan, session.accessToken, session.apiEnabled]),
  );

  return { loading, hasScan, products };
}
