import { useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/src/components/Card';
import { LockedOverlay } from '@/src/components/LockedOverlay';
import { PlanCard } from '@/src/components/PlanCard';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { savingsBadgeLabel } from '@/src/copy/paywall';
import { computeSavingsPercent } from '@/src/lib/planSavings';
import { spacing } from '@/src/theme';

import { GallerySection } from './GallerySection';

export function GalleryMonetizationSection() {
  const d = getCopy().dev.gallery.demos;
  const paywall = getCopy().paywall;
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const savings = computeSavingsPercent(49.99, 9.99);
  const badge = savings !== null ? savingsBadgeLabel(savings) : undefined;

  return (
    <GallerySection title={getCopy().dev.gallery.sections.monetization}>
      <LockedOverlay locked onUnlock={() => undefined}>
        <Card>
          <AppText variant="body">{d.lockedPreview}</AppText>
        </Card>
      </LockedOverlay>
      <View style={{ gap: spacing.sm }}>
        <PlanCard
          kind="annual"
          priceLabel={d.mockPriceAnnual}
          selected={plan === 'annual'}
          onSelect={() => setPlan('annual')}
          badgeLabel={badge}
          subtitle={paywall.trialNote}
        />
        <PlanCard
          kind="monthly"
          priceLabel={d.mockPriceMonthly}
          selected={plan === 'monthly'}
          onSelect={() => setPlan('monthly')}
        />
      </View>
    </GallerySection>
  );
}
