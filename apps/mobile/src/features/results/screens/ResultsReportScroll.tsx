import type { ConcernId, ZoneId } from '@dermis/domain';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { ResultsShareButton } from '../components/ResultsShareButton';
import type { useExportReportPdf } from '../hooks/useExportReportPdf';
import type { ResultsReport } from '../mock/resultsMockReport';
import { ResultsReportMain } from './ResultsReportMain';

type PdfState = ReturnType<typeof useExportReportPdf>;

export function ResultsReportScroll(props: {
  router: ReturnType<typeof useRouter>;
  report: ResultsReport;
  reportWhen: string;
  deltaLabel: string | undefined;
  skinAgeLabel: string | undefined;
  insight: string;
  concernDeltas: Partial<Record<ConcernId, string>> | undefined;
  zoneId: ZoneId | null;
  onSelectZone: (zoneId: ZoneId) => void;
  goPaywall: () => void;
  pdf: PdfState;
}) {
  const r = getCopy().screens.results;
  const back = props.router.canGoBack()
    ? () => props.router.back()
    : () => props.router.replace('/(tabs)/home');

  return (
    <Screen scroll padded edges={['top', 'left', 'right']} style={styles.screen} contentStyle={styles.content}>
      <Header
        title={r.reportTitle(props.reportWhen)}
        onBack={back}
        right={
          <ResultsShareButton busy={props.pdf.busy} onPress={() => void props.pdf.onExportPress()} />
        }
      />
      <ResultsReportMain
        report={props.report}
        deltaLabel={props.deltaLabel}
        skinAgeLabel={props.skinAgeLabel}
        insight={props.insight}
        concernDeltas={props.concernDeltas}
        zoneId={props.zoneId}
        onSelectZone={props.onSelectZone}
        goPaywall={props.goPaywall}
        onCompare={() => props.router.push('/(tabs)/progress')}
        onUpdateRoutine={() => props.router.push('/(tabs)/routine')}
      />
      <ToastHost
        message={props.pdf.toastMessage}
        visible={props.pdf.toastVisible}
        onDismiss={props.pdf.dismissToast}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.resultsCanvas },
  content: { gap: spacing.xl, paddingBottom: TAB_BAR_SCROLL_PAD + spacing.lg },
});
