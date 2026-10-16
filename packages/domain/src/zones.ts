/** Six face zones — fixed code-owned list. */
export const ZONE_IDS = [
  'forehead',
  'tZone',
  'leftCheek',
  'rightCheek',
  'periorbital',
  'chin',
] as const;

export type ZoneId = (typeof ZONE_IDS)[number];

export function isZoneId(value: string): value is ZoneId {
  return (ZONE_IDS as readonly string[]).includes(value);
}
