import { CONCERN_IDS, type ConcernId } from '@dermis/domain';
import {
  isElementUnlocked,
  resolveFreePreviewConcernId,
  type Plan,
} from '@dermis/domain/server';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing } from '@/src/theme';

export type ResultsProfessorNotesProps = {
  plan: Plan;
  concernScores: Record<ConcernId, number>;
  priorities: ConcernId[];
};

export function ResultsProfessorNotes({
  plan,
  concernScores,
  priorities,
}: ResultsProfessorNotesProps) {
  const r = getCopy().screens.results;
  const previewId = resolveFreePreviewConcernId(concernScores, priorities);
  const noteIds = useMemo(
    () => (isElementUnlocked(plan, 'otherConcerns') ? [...CONCERN_IDS] : [previewId]),
    [plan, previewId],
  );
  const [index, setIndex] = useState(0);
  const safeIndex = noteIds.length === 0 ? 0 : index % noteIds.length;
  const noteId = noteIds[safeIndex] ?? previewId;
  const note = r.notes[noteId];

  return (
    <View style={styles.card}>
      <AppText variant="caption" color={colors.professorNoteEyebrow} style={styles.eyebrow}>
        {r.professorEyebrow}
      </AppText>
      <AppText style={styles.headline} color={colors.surface}>
        {note.headline}
      </AppText>
      <AppText variant="body" color={colors.borderMuted} style={styles.body}>
        {note.body}
      </AppText>
      <View style={styles.footer}>
        {noteIds.length > 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={r.professorNext}
            onPress={() => setIndex((i) => (i + 1) % noteIds.length)}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.nextPressed]}
          >
            <AppText variant="caption" color={colors.surface} style={styles.nextLabel}>
              {r.professorNext}
            </AppText>
          </Pressable>
        ) : (
          <View />
        )}
        <View style={styles.mascot}>
          <Mascot character="professorPuff" mood="think" size={88} showBubble={false} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.professorNoteBg,
    borderRadius: radii.xxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    overflow: 'visible',
  },
  eyebrow: {
    fontFamily: fontFamilies.bodyBold,
    letterSpacing: 0.8,
  },
  headline: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 72,
    marginTop: spacing.sm,
  },
  nextBtn: {
    backgroundColor: colors.inkMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  nextPressed: {
    opacity: 0.85,
  },
  nextLabel: {
    fontFamily: fontFamilies.bodySemiBold,
  },
  mascot: {
    marginRight: -spacing.sm,
    marginBottom: -spacing.md,
  },
});
