/** Six scored concerns — code-owned list (not DB). */
export const concernCopy = {
  redness: 'Redness',
  fineLines: 'Fine lines',
  hydration: 'Hydration',
  darkSpots: 'Dark spots',
  texture: 'Texture',
  pores: 'Pores',
} as const;

export const concernList = [
  concernCopy.redness,
  concernCopy.fineLines,
  concernCopy.hydration,
  concernCopy.darkSpots,
  concernCopy.texture,
  concernCopy.pores,
] as const;
