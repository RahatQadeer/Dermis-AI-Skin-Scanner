/** Read a process env var without requiring `@types/node` in this package. */
export function readProcessEnv(name: string): string {
  const g = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return (g.process?.env?.[name] ?? '').trim();
}
