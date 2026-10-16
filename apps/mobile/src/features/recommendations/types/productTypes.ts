import type { ConcernId } from '@dermis/domain';

export type PlaceholderProduct = {
  id: string;
  /** Ingredient category shown above the name (e.g. "BHA exfoliant"). */
  category: string;
  name: string;
  /** Short description (reads over ~2 lines). */
  summary: string;
  /** Primary concern shown in the score chip. */
  primaryConcern: ConcernId;
  /** Concern score shown beside the chip label (0–100). */
  score: number;
  /** When set, replaces the concern+score chip (e.g. "Prevention"). */
  badgeLabel?: string;
  /** Display price label, e.g. "$32". */
  priceLabel: string;
  /** All concerns this item relates to (used for filtering). */
  concernIds: readonly ConcernId[];
};
