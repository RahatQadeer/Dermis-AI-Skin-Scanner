import { Image, StyleSheet, View } from 'react-native';

import { colors, radii } from '@/src/theme';

import { productImageSource } from '../lib/productImages';

/** Real product-style photo when available; soft tint fallback otherwise. */
export function ProductThumb({ productId }: { productId: string }) {
  const source = productImageSource(productId);

  if (source) {
    return (
      <View style={styles.frame}>
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return <View style={[styles.frame, styles.fallback]} />;
}

const styles = StyleSheet.create({
  frame: {
    width: 84,
    height: 84,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.noteSoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: colors.greenSoft,
  },
});
