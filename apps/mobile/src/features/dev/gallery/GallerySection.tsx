import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, spacing } from '@/src/theme';

export type GallerySectionProps = {
  title: string;
  children: ReactNode;
};

export function GallerySection({ title, children }: GallerySectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="headline" color={colors.ink}>
        {title}
      </AppText>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  body: {
    gap: spacing.md,
  },
});
