import type { ImageSourcePropType } from 'react-native';

/**
 * Local unbranded product-style photos (not Google Search / not brand catalogs).
 * Gemini cannot fetch Google image results into the app.
 */
const BY_ID: Record<string, ImageSourcePropType> = {
  'bha-exfoliant': require('../../../../assets/images/actives/bha-exfoliant.jpg'),
  retinoid: require('../../../../assets/images/actives/retinoid.jpg'),
  'brightening-serum': require('../../../../assets/images/actives/brightening-serum.jpg'),
  'mineral-sunscreen': require('../../../../assets/images/actives/mineral-sunscreen.jpg'),
  'balancing-serum': require('../../../../assets/images/actives/balancing-serum.jpg'),
  'barrier-cream': require('../../../../assets/images/actives/barrier-cream.jpg'),
};

export function productImageSource(productId: string): ImageSourcePropType | null {
  return BY_ID[productId] ?? null;
}
