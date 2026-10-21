/** Server step ids are UUIDs; mock/local seeds use prefixes like `am-1`. */
export function isPersistedStepId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function localStepId(period: 'am' | 'pm', label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 24);
  return `${period}-local-${slug}-${String(Date.now())}`;
}
