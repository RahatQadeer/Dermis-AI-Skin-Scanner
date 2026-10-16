import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const register = path.join(root, 'scripts/register-ts-resolve.mjs');

function collectTests(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTests(full));
    } else if (entry.name.endsWith('.test.ts')) {
      files.push(full);
    }
  }
  return files;
}

const tests = collectTests(srcDir);
if (tests.length === 0) {
  console.error('No mobile unit tests found');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ['--import', register, '--experimental-strip-types', '--test', ...tests],
  { stdio: 'inherit', cwd: root },
);

process.exit(result.status ?? 1);
