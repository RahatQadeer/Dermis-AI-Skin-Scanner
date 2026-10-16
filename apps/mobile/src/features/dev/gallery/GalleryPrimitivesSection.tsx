import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { Chip } from '@/src/components/Chip';
import { IconButton } from '@/src/components/IconButton';
import { ListRow } from '@/src/components/ListRow';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { GallerySection } from './GallerySection';

export function GalleryPrimitivesSection() {
  const d = getCopy().dev.gallery.demos;
  const [chipOn, setChipOn] = useState(true);

  return (
    <GallerySection title={getCopy().dev.gallery.sections.primitives}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Button label={d.primary} onPress={() => undefined} />
        <Button label={d.secondary} variant="secondary" onPress={() => undefined} />
      </View>
      <Card>
        <AppText variant="body">{d.listRow}</AppText>
      </Card>
      <Chip label={d.chip} selected={chipOn} onPress={() => setChipOn((v) => !v)} />
      <ListRow title={d.listRow} subtitle={getCopy().dev.gallery.devBadge} />
      <IconButton accessibilityLabel={d.chip}>
        <AppText variant="caption">{d.addIconGlyph}</AppText>
      </IconButton>
    </GallerySection>
  );
}
