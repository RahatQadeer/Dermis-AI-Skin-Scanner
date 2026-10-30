/** Read a process env var without requiring `@types/node` in this package. */
export function readProcessEnv(name: string): string {
  const g = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return (g.process?.env?.[name] ?? '').trim();
}

/**
 * True for deployed backends and release app bundles. Testing overrides
 * (unlock-all, raised free scans, dev Pro grants) are ignored when this holds,
 * whatever else the environment says.
 */
export function isProductionRuntime(): boolean {
  // React Native release bundles set the global __DEV__ = false.
  const g = globalThis as typeof globalThis & { __DEV__?: boolean };
  return g.__DEV__ === false || readProcessEnv('NODE_ENV') === 'production';
}
