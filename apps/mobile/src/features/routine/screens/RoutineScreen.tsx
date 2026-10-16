import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PartyConfetti } from '@/src/components/celebration/PartyConfetti';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { useHomeSnapshot } from '@/src/features/home/hooks/useHomeSnapshot';
import { colors } from '@/src/theme';
import { isElementUnlocked } from '@dermis/domain/server';

import { RoutineCompleteBanner } from '../components/RoutineCompleteBanner';
import { RoutineLoadingView } from '../components/RoutineLoadingView';
import { RoutineStepSheet } from '../components/RoutineStepSheet';
import { useRoutineEditMode } from '../hooks/useRoutineEditMode';
import { useRoutineFlow } from '../hooks/useRoutineFlow';
import { buildInitialRoutineState } from '../mock/buildInitialRoutineState';
import { RoutineScreenBody } from './RoutineScreenBody';

/** Sheet/Modal must sit outside ScrollView — nesting breaks presentation on device. */
export function RoutineScreen() {
  const snapshot = useHomeSnapshot();
  const unlocked = isElementUnlocked(snapshot.quota.plan, 'routine');
  const edit = useRoutineEditMode();
  const initial = useMemo(() => buildInitialRoutineState(snapshot.routine), [snapshot.routine]);
  const flow = useRoutineFlow(initial);

  if (flow.loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
        <StatusBar style="dark" />
        <RoutineLoadingView />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <StatusBar style="dark" />
      <RoutineScreenBody
        flow={flow}
        unlocked={unlocked}
        editing={edit.editing}
        editDoneSparkle={edit.editDoneSparkle}
        onEditPress={edit.onEditPress}
      />
      <PartyConfetti active={edit.editDoneSparkle} burstKey={edit.editBurstKey} />
      <RoutineStepSheet
        sheet={flow.sheet}
        period={flow.period}
        draftLabel={flow.draftLabel}
        labelError={flow.labelError}
        concernScores={snapshot.scan?.concernScores}
        isSuggestionAdded={flow.isSuggestionAdded}
        doneSparkle={flow.doneSparkle}
        onChangeLabel={flow.setDraftLabel}
        onSave={flow.onSaveSheet}
        onToggleSuggestion={flow.onToggleSuggestion}
        onDone={flow.onDoneSheet}
        onClose={flow.closeSheet}
      />
      <ToastHost message={flow.toastMessage} visible={flow.toastVisible} onDismiss={flow.dismissToast} />
      <RoutineCompleteBanner
        message={flow.completeMessage}
        visible={flow.completeVisible}
        onDismiss={flow.dismissComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
