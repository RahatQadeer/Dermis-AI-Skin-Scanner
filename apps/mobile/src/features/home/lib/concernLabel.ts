import type { ConcernId } from '@dermis/domain';

import { concernCopy } from '@/src/copy/concerns';

const LABELS: Record<ConcernId, string> = {
  redness: concernCopy.redness,
  fineLines: concernCopy.fineLines,
  hydration: concernCopy.hydration,
  darkSpots: concernCopy.darkSpots,
  texture: concernCopy.texture,
  pores: concernCopy.pores,
};

export function concernLabel(id: ConcernId): string {
  return LABELS[id];
}
