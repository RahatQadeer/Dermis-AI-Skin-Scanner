/**
 * Resolves extensionless relative imports and Expo `@/` alias for Node tests.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const mapped = path.join(mobileRoot, specifier.slice(2));
    const withTs = mapped.endsWith('.ts') || mapped.endsWith('.tsx') ? mapped : `${mapped}.ts`;
    try {
      return await nextResolve(pathToFileURL(withTs).href, context);
    } catch {
      return nextResolve(pathToFileURL(mapped).href, context);
    }
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    !/\.(?:[cm]?[jt]s|json)$/.test(specifier)
  ) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // fall through
    }
  }
  return nextResolve(specifier, context);
}
