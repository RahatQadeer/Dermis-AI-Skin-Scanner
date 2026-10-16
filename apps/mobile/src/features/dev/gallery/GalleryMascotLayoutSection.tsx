import { useState } from 'react';

import { Mascot } from '@/src/components/mascot/Mascot';
import { Header } from '@/src/components/layout/Header';
import { TabBar } from '@/src/components/layout/TabBar';
import type { TabId } from '@/src/components/layout/tabBarTypes';
import { getCopy } from '@/src/copy';

import { GallerySection } from './GallerySection';

export function GalleryMascotSection() {
  return (
    <GallerySection title={getCopy().dev.gallery.sections.mascot}>
      <Mascot mood="happy" showBubble />
    </GallerySection>
  );
}

export function GalleryLayoutSection() {
  const nav = getCopy().nav;
  const [tab, setTab] = useState<TabId>('home');

  return (
    <GallerySection title={getCopy().dev.gallery.sections.layout}>
      <Header title={nav.appHeader} onBack={() => undefined} />
      <TabBar active={tab} onSelect={setTab} />
    </GallerySection>
  );
}
