import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../tools/eslint-fixtures');
const outFile = path.join(outDir, 'over301.ts');

fs.mkdirSync(outDir, { recursive: true });

const lines = [
  '// Generated fixture for DERM-001 — never import in the app.',
  'export function over301Fixture(): number {',
  '  let total = 0;',
];

for (let i = 1; i <= 305; i += 1) {
  lines.push(`  total += ${i};`);
}

lines.push('  return total;', '}', '');

fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Wrote ${lines.length} lines to ${outFile}`);
