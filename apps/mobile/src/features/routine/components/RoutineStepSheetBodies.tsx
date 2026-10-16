import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TextField } from '@/src/components/TextField';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing, touchTargets } from '@/src/theme';

import type { RoutineSuggestion } from '../lib/routineSuggestions';
import { RoutineStepCustomRow } from './RoutineStepCustomRow';
import { RoutineStepSuggestList } from './RoutineStepSuggestList';

export function RoutineStepSheetEditBody(props: {
  draftLabel: string;
  labelError?: string;
  onChangeLabel: (value: string) => void;
  onSave: () => void;
}) {
  const r = getCopy().screens.routine;
  return (
    <View style={styles.editBody}>
      <TextField
        label={r.stepLabelField}
        placeholder={r.stepLabelPlaceholder}
        value={props.draftLabel}
        onChangeText={props.onChangeLabel}
        error={props.labelError}
        autoFocus
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={r.saveStep}
        onPress={props.onSave}
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
      >
        <AppText variant="bodyStrong" color={colors.surface} align="center">
          {r.saveStep}
        </AppText>
      </Pressable>
    </View>
  );
}

export function RoutineStepSheetAddBody(props: {
  suggestions: RoutineSuggestion[];
  draftLabel: string;
  labelError?: string;
  doneSparkle: boolean;
  isSuggestionAdded: (label: string) => boolean;
  onChangeLabel: (value: string) => void;
  onSave: () => void;
  onToggleSuggestion: (label: string) => void;
  onDone: () => void;
}) {
  const r = getCopy().screens.routine;
  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <RoutineStepSuggestList
          suggestions={props.suggestions}
          isSuggestionAdded={props.isSuggestionAdded}
          onToggleSuggestion={props.onToggleSuggestion}
        />
        <RoutineStepCustomRow
          draftLabel={props.draftLabel}
          labelError={props.labelError}
          onChangeLabel={props.onChangeLabel}
          onSave={props.onSave}
        />
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={r.sheetDone}
        onPress={props.onDone}
        disabled={props.doneSparkle}
        style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
      >
        <AppText variant="bodyStrong" color={colors.surface} align="center">
          {r.sheetDone}
        </AppText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  scrollBody: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  editBody: {
    gap: spacing.md,
  },
  doneBtn: {
    marginTop: spacing.sm,
    minHeight: touchTargets.min,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryBtn: {
    minHeight: touchTargets.min,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
  },
});
