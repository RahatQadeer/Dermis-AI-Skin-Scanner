import type { ConcernId, ZoneId } from '@dermis/domain';

import { ResultsActions } from '../components/ResultsActions';
import { ResultsConcernList } from '../components/ResultsConcernList';
import { ResultsIndexHero } from '../components/ResultsIndexHero';
import { ResultsProfessorNotes } from '../components/ResultsProfessorNotes';
import { ResultsZoneSection } from '../components/ResultsZoneSection';
import type { ResultsReport } from '../mock/resultsMockReport';

export function ResultsReportMain(props: {
  report: ResultsReport;
  deltaLabel: string | undefined;
  skinAgeLabel: string | undefined;
  insight: string;
  concernDeltas: Partial<Record<ConcernId, string>> | undefined;
  zoneId: ZoneId | null;
  onSelectZone: (zoneId: ZoneId) => void;
  goPaywall: () => void;
  onCompare: () => void;
  onUpdateRoutine: () => void;
}) {
  return (
    <>
      <ResultsIndexHero
        indexScore={props.report.scan.indexScore}
        deltaLabel={props.deltaLabel}
        skinAgeLabel={props.skinAgeLabel}
        insight={props.insight}
      />
      <ResultsZoneSection
        plan={props.report.plan}
        zoneScores={props.report.zoneScores}
        selectedZoneId={props.zoneId}
        onSelectZone={props.onSelectZone}
        onUnlock={props.goPaywall}
      />
      <ResultsProfessorNotes
        plan={props.report.plan}
        concernScores={props.report.scan.concernScores}
        priorities={props.report.scan.priorities}
      />
      <ResultsConcernList
        plan={props.report.plan}
        concernScores={props.report.scan.concernScores}
        priorities={props.report.scan.priorities}
        concernDeltas={props.concernDeltas}
        onUnlock={props.goPaywall}
      />
      <ResultsActions onCompare={props.onCompare} onUpdateRoutine={props.onUpdateRoutine} />
    </>
  );
}
