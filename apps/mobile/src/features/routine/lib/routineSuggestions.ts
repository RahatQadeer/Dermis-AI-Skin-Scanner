import type { ConcernId } from '@dermis/domain';

import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';

export type RoutineSuggestion = {
  id: string;
  label: string;
  subtitle: string;
  concernId: ConcernId;
  badge: string;
};

export function buildRoutineSuggestions(
  concernScores: Partial<Record<ConcernId, number>> | null | undefined,
): RoutineSuggestion[] {
  const r = getCopy().screens.routine;
  return r.suggestions.map((item) => {
    const score = concernScores?.[item.concernId];
    const badge =
      score === undefined
        ? concernLabel(item.concernId)
        : `${concernLabel(item.concernId)} ${String(score)}`;
    return {
      id: item.id,
      label: item.label,
      subtitle: item.subtitle,
      concernId: item.concernId,
      badge,
    };
  });
}
