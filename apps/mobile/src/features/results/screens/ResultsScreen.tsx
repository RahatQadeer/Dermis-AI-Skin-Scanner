import type { ZoneId } from '@dermis/domain';
import { useCallback, useState } from 'react';

import { useResultsScreen } from '../hooks/useResultsScreen';
import {
  ResultsScreenEmpty,
  ResultsScreenLoading,
  ResultsScreenReport,
} from './ResultsScreenStates';

export function ResultsScreen() {
  const screen = useResultsScreen();
  const [zoneBurstKey, setZoneBurstKey] = useState(0);

  const onSelectZone = useCallback(
    (next: ZoneId) => {
      screen.setZoneId(next);
      setZoneBurstKey((k) => k + 1);
    },
    [screen],
  );

  if (screen.loading) {
    return <ResultsScreenLoading router={screen.router} />;
  }

  if (!screen.report) {
    return <ResultsScreenEmpty router={screen.router} goScan={screen.goScan} />;
  }

  return (
    <ResultsScreenReport
      router={screen.router}
      report={screen.report}
      reportWhen={screen.reportWhen}
      deltaLabel={screen.deltaLabel}
      skinAgeLabel={screen.skinAgeLabel}
      insight={screen.insight}
      concernDeltas={screen.concernDeltas}
      zoneId={screen.zoneId}
      onSelectZone={onSelectZone}
      zoneBurstKey={zoneBurstKey}
      goPaywall={screen.goPaywall}
      pdf={screen.pdf}
    />
  );
}
