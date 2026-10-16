import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Chip } from '@/src/components/Chip';
import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { GalleryDataSection } from '../gallery/GalleryDataSection';
import { GalleryFeedbackSection } from '../gallery/GalleryFeedbackSection';
import { GalleryInputsSection } from '../gallery/GalleryInputsSection';
import { GalleryLayoutSection, GalleryMascotSection } from '../gallery/GalleryMascotLayoutSection';
import { GalleryMonetizationSection } from '../gallery/GalleryMonetizationSection';
import { GalleryPrimitivesSection } from '../gallery/GalleryPrimitivesSection';

export function ComponentGalleryScreen() {
  const router = useRouter();
  const gallery = getCopy().dev.gallery;

  return (
    <Screen scroll padded edges={['top', 'left', 'right', 'bottom']}>
      <Header title={gallery.title} onBack={() => router.back()} />
      <Chip label={gallery.devBadge} selected />
      <View style={styles.sections}>
        <GalleryPrimitivesSection />
        <GalleryInputsSection />
        <GalleryFeedbackSection />
        <GalleryDataSection />
        <GalleryMascotSection />
        <GalleryLayoutSection />
        <GalleryMonetizationSection />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
