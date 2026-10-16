import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/src/components/Button';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { Sheet } from '@/src/components/layout/Sheet';
import { Skeleton } from '@/src/components/Skeleton';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { GallerySection } from './GallerySection';

export function GalleryFeedbackSection() {
  const d = getCopy().dev.gallery.demos;
  const feedback = getCopy().feedback;
  const [toastVisible, setToastVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <GallerySection title={getCopy().dev.gallery.sections.feedback}>
      <SpeechBubble message={getCopy().mascot.dermis.welcomeLines[0]} />
      <Skeleton height={48} />
      <EmptyState title={feedback.emptyDefaultTitle} body={feedback.emptyDefaultBody} />
      <ErrorState title={feedback.errorDefaultTitle} body={feedback.errorDefaultBody} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button label={d.showToast} onPress={() => setToastVisible(true)} />
        <Button label={d.openSheet} variant="secondary" onPress={() => setSheetOpen(true)} />
      </View>
      <ToastHost
        message={d.toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title={d.sheetTitle}>
        <SpeechBubble message={d.sheetBody} tail="right" />
      </Sheet>
    </GallerySection>
  );
}
