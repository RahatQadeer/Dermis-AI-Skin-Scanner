import { CONCERN_IDS, type ConcernId } from '@dermis/domain';
import {
  isElementUnlocked,
  resolveFreePreviewConcernId,
  type Plan,
} from '@dermis/domain/server';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { clampScore } from '@/src/lib/clampScore';
import { colors, spacing } from '@/src/theme';

import { ConcernResultCard } from './ConcernResultCard';

export type ResultsConcernListProps = {
  plan: Plan;
  concernScores: Record<ConcernId, number>;
  priorities: ConcernId[];
  concernDeltas?: Partial<Record<ConcernId, string>>;
  onUnlock: () => void;
};

function concernLocked(plan: Plan, id: ConcernId, previewId: ConcernId): boolean {
  if (isElementUnlocked(plan, 'otherConcerns')) {
    return false;
  }
  return previewId !== id;
}

export function ResultsConcernList({
  plan,
  concernScores,
  priorities,
  concernDeltas,
  onUnlock,
}: ResultsConcernListProps) {
  const r = getCopy().screens.results;
  const previewId = resolveFreePreviewConcernId(concernScores, priorities);

  return (
    <View style={styles.block}>
      <View style={styles.headerRow}>
        <AppText variant="headline" color={colors.ink}>
          {r.concernsTitle}
        </AppText>
        <AppText variant="caption" color={colors.muteFoot}>
          {r.concernsHigherBetter}
        </AppText>
      </View>
      {CONCERN_IDS.map((id) => (
        <ConcernResultCard
          key={id}
          id={id}
          locked={concernLocked(plan, id, previewId)}
          score={clampScore(concernScores[id])}
          delta={concernDeltas?.[id]}
          onUnlock={onUnlock}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
