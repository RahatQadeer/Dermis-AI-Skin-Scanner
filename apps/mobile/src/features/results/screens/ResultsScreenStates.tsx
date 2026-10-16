import type { ConcernId, ZoneId } from '@dermis/domain';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/src/components/EmptyState';
import { PartyConfetti } from '@/src/components/celebration/PartyConfetti';
import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import type { useExportReportPdf } from '../hooks/useExportReportPdf';
import type { ResultsReport } from '../mock/resultsMockReport';
import { ResultsReportScroll } from './ResultsReportScroll';

type PdfState = ReturnType<typeof useExportReportPdf>;

export function ResultsScreenLoading({ router }: { router: ReturnType<typeof useRouter> }) {
  const r = getCopy().screens.results;
  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <StatusBar style="dark" />
      <Header
        title={r.title}
        onBack={router.canGoBack() ? () => router.back() : () => router.replace('/(tabs)/home')}
      />
      <ActivityIndicator color={colors.ink} style={styles.loader} />
    </Screen>
  );
}

export function ResultsScreenEmpty({
  router,
  goScan,
}: {
  router: ReturnType<typeof useRouter>;
  goScan: () => void;
}) {
  const r = getCopy().screens.results;
  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <StatusBar style="dark" />
      <Header
        title={r.title}
        onBack={router.canGoBack() ? () => router.back() : () => router.replace('/(tabs)/home')}
      />
      <EmptyState title={r.emptyTitle} body={r.emptyBody} actionLabel={r.emptyCta} onAction={goScan} />
    </Screen>
  );
}

export function ResultsScreenReport(props: {
  router: ReturnType<typeof useRouter>;
  report: ResultsReport;
  reportWhen: string;
  deltaLabel: string | undefined;
  skinAgeLabel: string | undefined;
  insight: string;
  concernDeltas: Partial<Record<ConcernId, string>> | undefined;
  zoneId: ZoneId | null;
  onSelectZone: (zoneId: ZoneId) => void;
  zoneBurstKey: number;
  goPaywall: () => void;
  pdf: PdfState;
}) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ResultsReportScroll {...props} />
      <PartyConfetti active={props.zoneBurstKey > 0} burstKey={props.zoneBurstKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { backgroundColor: colors.resultsCanvas },
  loader: { marginTop: spacing.xxl },
});
