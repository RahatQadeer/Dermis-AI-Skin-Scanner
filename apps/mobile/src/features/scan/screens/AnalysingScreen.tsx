import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { AnalysingPortrait } from '../components/AnalysingPortrait';
import { AnalysingSteps } from '../components/AnalysingSteps';
import { ScanAiConsentSheet } from '../components/ScanAiConsentSheet';
import { useAnalysingPipeline } from '../hooks/useAnalysingPipeline';

export function AnalysingScreen() {
  const a = getCopy().screens.analysing;
  const pipeline = useAnalysingPipeline();
  const pct = Math.round(pipeline.progress);
  const ready = pct >= 100;

  return (
    <Screen
      padded
      edges={['top', 'left', 'right', 'bottom']}
      style={styles.screen}
      contentStyle={styles.content}
    >
      <StatusBar style="light" />
      <View style={styles.center}>
        <AnalysingPortrait />
        <View style={styles.pctRow}>
          <AppText variant="display" color={colors.surface}>
            {String(pct)}
          </AppText>
          <AppText variant="title" color={colors.borderMuted} style={styles.pctSign}>
            %
          </AppText>
        </View>
        <AppText variant="headline" color={colors.surface} align="center">
          {ready ? a.ready : a.subtitle}
        </AppText>
        <AnalysingSteps steps={a.steps} activeStep={pipeline.activeStep} />
      </View>
      <AppText variant="caption" color={colors.borderMuted} align="center">
        {a.footnote}
      </AppText>
      <ScanAiConsentSheet
        visible={pipeline.consentOpen}
        busy={pipeline.busyConsent}
        onAllow={() => {
          void pipeline.onAllowConsent();
        }}
        onDecline={pipeline.onDeclineConsent}
      />
      <ToastHost
        message={pipeline.errorMessage ?? ''}
        visible={Boolean(pipeline.errorMessage)}
        onDismiss={pipeline.dismissError}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
  },
  content: {
    flex: 1,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pctSign: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
});
