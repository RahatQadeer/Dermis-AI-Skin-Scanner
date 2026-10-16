import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { concernCopy } from '@/src/copy/concerns';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies } from '@/src/theme';

import type { QuizDraft } from '../lib/quizLogic';

export function SummaryAnswerTable({ draft }: { draft: QuizDraft }) {
  const summary = getCopy().screens.summary;
  const concerns = draft.priorities.map((id) => concernCopy[id]).join(summary.concernsSeparator);

  const rows = [
    { label: summary.rowSkinType, value: draft.skinFeel ?? '' },
    { label: summary.rowTone, value: draft.fitzpatrick ?? '' },
    { label: summary.rowConcerns, value: concerns },
    { label: summary.rowSensitivity, value: draft.productReaction ?? '' },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index < rows.length - 1 ? styles.rowBorder : null]}
        >
          <AppText style={styles.label} color={colors.muteSoft}>
            {row.label}
          </AppText>
          <AppText style={styles.value} color={colors.ink} numberOfLines={2}>
            {row.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rowDivider,
  },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 0,
  },
  value: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'right',
    flex: 1,
  },
});
