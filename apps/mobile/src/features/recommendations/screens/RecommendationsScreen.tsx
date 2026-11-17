import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { getCopy } from '@/src/copy';
import { useScanNavigation } from '@/src/features/consent/hooks/useScanNavigation';
import { motion, spacing } from '@/src/theme';

import { RecommendationsContent } from '../components/RecommendationsContent';
import { useAddActiveToRoutine } from '../hooks/useAddActiveToRoutine';
import { useRecommendations } from '../hooks/useRecommendations';

function paramIsRoutine(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'routine';
}

function useRecommendationsBack(fromRoutine: boolean): () => void {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fromRoutine ? '/routine' : '/(tabs)/home');
  };
}

export function RecommendationsScreen() {
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const fromRoutine = paramIsRoutine(params.from);
  const r = getCopy().screens.recommendations;
  const { goScan } = useScanNavigation();
  const { loading, hasScan, products } = useRecommendations();
  const add = useAddActiveToRoutine();
  const onBack = useRecommendationsBack(fromRoutine);

  return (
    <Screen
      scroll
      padded
      edges={['top', 'left', 'right', 'bottom']}
      contentStyle={styles.content}
    >
      <StatusBar style="dark" />
      <Header title={fromRoutine ? r.titleFromRoutine : r.title} onBack={onBack} />
      <RecommendationsContent
        loading={loading}
        hasScan={hasScan}
        products={products}
        fromRoutine={fromRoutine}
        add={add}
        onScan={goScan}
      />
      <ToastHost
        message={add.feedback?.message ?? ''}
        visible={Boolean(add.feedback)}
        onDismiss={add.clearFeedback}
        durationMs={motion.duration.toastImportant}
        celebrate={Boolean(add.feedback?.ok)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
});
