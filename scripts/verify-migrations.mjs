import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationsDir = path.join(process.cwd(), 'backend/supabase/migrations');

const USER_TABLES = [
  'profiles',
  'entitlements',
  'scan_usage',
  'scans',
  'user_consents',
  'routine_steps',
  'routine_step_completions',
];

function readMigrations() {
  assert.ok(fs.existsSync(migrationsDir), `missing ${migrationsDir}`);
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  assert.ok(files.length > 0, 'expected at least one migration');
  return files.map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n');
}

export function verifyMigrationsSql(sql) {
  for (const table of USER_TABLES) {
    assert.match(
      sql,
      new RegExp(`create table public\\.${table}\\b`, 'i'),
      `missing create table for ${table}`,
    );
    assert.match(
      sql,
      new RegExp(`alter table public\\.${table} enable row level security`, 'i'),
      `missing RLS enable for ${table}`,
    );
  }

  assert.match(sql, /consume_scan_quota/i, 'missing consume_scan_quota function');
  assert.match(sql, /delete_user_data/i, 'missing delete_user_data function');
  assert.match(sql, /handle_new_user/i, 'missing signup bootstrap trigger');
  assert.match(
    sql,
    /create table public\.billing_webhook_events\b/i,
    'missing billing_webhook_events table',
  );
  assert.match(
    sql,
    /alter table public\.billing_webhook_events enable row level security/i,
    'missing RLS on billing_webhook_events',
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyMigrationsSql(readMigrations());
  console.log('verify-migrations: ok');
}
