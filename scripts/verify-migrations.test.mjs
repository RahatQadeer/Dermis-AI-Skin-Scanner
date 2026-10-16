import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { verifyMigrationsSql } from './verify-migrations.mjs';

test('DERM-040 migrations define tables, RLS, and quota/deletion helpers', () => {
  const dir = path.join(process.cwd(), 'backend/supabase/migrations');
  const sql = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
    .join('\n');
  assert.doesNotThrow(() => verifyMigrationsSql(sql));
});
