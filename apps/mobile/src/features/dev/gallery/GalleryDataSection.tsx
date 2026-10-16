import { BeforeAfterCard } from '@/src/components/BeforeAfterCard';
import { ProgressRing } from '@/src/components/ProgressRing';
import { ScoreBar } from '@/src/components/ScoreBar';
import { StatCard } from '@/src/components/StatCard';
import { TrendChart } from '@/src/components/TrendChart';
import { ZoneMap } from '@/src/components/ZoneMap';
import { getCopy } from '@/src/copy';

import { GallerySection } from './GallerySection';

const DEMO_ZONES = {
  forehead: 72,
  tZone: 65,
  leftCheek: 78,
  rightCheek: 76,
  periorbital: 70,
  chin: 68,
} as const;

export function GalleryDataSection() {
  const d = getCopy().dev.gallery.demos;

  return (
    <GallerySection title={getCopy().dev.gallery.sections.data}>
      <StatCard title={d.statLabel} value={d.statValue} caption={d.afterLabel} />
      <ScoreBar label={d.comparisonTitle} score={68} deltaLabel={d.scoreDelta} />
      <ProgressRing progress={72} size={96} label={d.statLabel} />
      <TrendChart
        title={d.trendTitle}
        points={[
          { label: d.weekOne, value: 64 },
          { label: d.weekTwo, value: 68 },
          { label: d.weekThree, value: 70 },
          { label: d.weekFour, value: 72 },
        ]}
      />
      <ZoneMap scores={DEMO_ZONES} size={200} />
      <BeforeAfterCard
        title={d.comparisonTitle}
        beforeLabel={d.beforeLabel}
        afterLabel={d.afterLabel}
        beforeScore={62}
        afterScore={71}
      />
    </GallerySection>
  );
}
