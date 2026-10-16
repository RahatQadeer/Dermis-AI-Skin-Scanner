import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../tools/eslint-fixtures/over301.ts',
);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(
  process.execPath,
  ['node_modules/eslint/bin/eslint.js', '--no-ignore', fixture],
  { encoding: 'utf-8', cwd: root },
);

if (result.status === 0) {
  console.error('Expected ESLint to fail on a 301-line file, but it passed.');
  process.exit(1);
}

if (!String(result.stdout + result.stderr).includes('max-lines')) {
  console.error('ESLint failed, but not due to max-lines rule.');
  console.error(result.stdout);
  console.error(result.stderr);
  process.exit(1);
}

console.log('max-lines rule correctly rejects the 301-line fixture.');
