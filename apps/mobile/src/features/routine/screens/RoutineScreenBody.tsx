import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { LockedOverlay } from '@/src/components/LockedOverlay';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { EditButton } from '../components/EditButton';
import { RoutineBody } from '../components/RoutineBody';
import type { useRoutineFlow } from '../hooks/useRoutineFlow';

export function RoutineScreenBody(props: {
  flow: ReturnType<typeof useRoutineFlow>;
  unlocked: boolean;
  editing: boolean;
  editDoneSparkle: boolean;
  onEditPress: () => void;
}) {
  const router = useRouter();
  const nav = getCopy().nav;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
    >
      <View style={styles.titleRow}>
        <AppText variant="display" color={colors.ink}>
          {nav.routine}
        </AppText>
        <EditButton
          active={props.editing}
          disabled={props.editDoneSparkle}
          onPress={props.onEditPress}
        />
      </View>
      <LockedOverlay
        locked={!props.unlocked}
        onUnlock={() => router.push('/paywall')}
        hint={getCopy().screens.routine.lockedHint}
      >
        <RoutineBody flow={props.flow} unlocked={props.unlocked} editing={props.editing} />
      </LockedOverlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
