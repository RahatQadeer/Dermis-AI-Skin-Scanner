import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import type { RoutineSuggestion } from '../lib/routineSuggestions';
import { RoutineSuggestionRow } from './RoutineSuggestionRow';

export function RoutineStepSuggestList(props: {
  suggestions: RoutineSuggestion[];
  isSuggestionAdded: (label: string) => boolean;
  onToggleSuggestion: (label: string) => void;
}) {
  const r = getCopy().screens.routine;
  return (
    <>
      <AppText variant="caption" color={colors.muteFoot} style={styles.sectionEyebrow}>
        {r.suggestedHeading}
      </AppText>
      <View style={styles.suggestList}>
        {props.suggestions.map((item) => (
          <RoutineSuggestionRow
            key={item.id}
            item={item}
            added={props.isSuggestionAdded(item.label)}
            onToggle={props.onToggleSuggestion}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionEyebrow: {
    letterSpacing: 0.7,
    marginTop: spacing.xs,
  },
  suggestList: {
    gap: spacing.sm,
  },
});
