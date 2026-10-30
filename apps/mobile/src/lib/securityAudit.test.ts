import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { isAllowedApiBaseUrl } from '../lib/api/config';
import { isSafeLegalUrl } from '../features/auth/lib/legalUrlPolicy';

const mobileRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.join(mobileRoot, '../..');
const srcRoot = path.join(mobileRoot, 'src');

const ALLOWED_ENV_KEYS = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_TERMS_URL',
  'EXPO_PUBLIC_PRIVACY_URL',
  'EXPO_PUBLIC_MOCK_HOME_SCENARIO',
  'EXPO_PUBLIC_REVENUECAT_API_KEY',
  'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY',
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  'EXPO_PUBLIC_UNLOCK_ALL_FEATURES',
  'EXPO_PUBLIC_BILLING_MODE',
  'EXPO_PUBLIC_FACE_MODEL_URL',
  'EXPO_PUBLIC_FACE_MATCH_THRESHOLD',
] as const;

const FORBIDDEN_SUBSTRINGS = [
  'GEMINI_API_KEY',
  'SUPABASE_SERVICE_ROLE',
  'SUPABASE_SERVICE_ROLE_KEY',
  'sk_live_',
  'sk_test_',
  'AIza',
] as const;

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('security audit (DERM-068)', () => {
  it('gitignore ignores env/key material and keeps .env.example', () => {
    const gitignore = readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');
    assert.match(gitignore, /^\.env$/m);
    assert.match(gitignore, /^\.env\.\*$/m);
    assert.match(gitignore, /^!\.env\.example$/m);
    assert.match(gitignore, /\*\.key/);
  });

  it('mobile src avoids server secrets and forbidden key patterns', () => {
    const files = collectTsFiles(srcRoot);
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const needle of FORBIDDEN_SUBSTRINGS) {
        if (text.includes(needle)) {
          hits.push(`${path.relative(mobileRoot, file)}:${needle}`);
        }
      }
    }
    assert.deepEqual(hits, []);
  });

  it('process.env usage in mobile src stays on EXPO_PUBLIC allowlist', () => {
    const files = collectTsFiles(srcRoot);
    const hits: string[] = [];
    const envRead = /process\.env\.([A-Z0-9_]+)/g;
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(envRead)) {
        const key = match[1];
        if (!ALLOWED_ENV_KEYS.includes(key as (typeof ALLOWED_ENV_KEYS)[number])) {
          hits.push(`${path.relative(mobileRoot, file)}:${key}`);
        }
      }
    }
    assert.deepEqual(hits, []);
  });

  it('release API base URL must be https', () => {
    assert.equal(isAllowedApiBaseUrl('https://api.example.com'), true);
    assert.equal(isAllowedApiBaseUrl('http://127.0.0.1:8787'), true);
  });

  it('legal URLs must be https', () => {
    assert.equal(isSafeLegalUrl('https://example.com/privacy'), true);
    assert.equal(isSafeLegalUrl('http://example.com/privacy'), false);
    assert.equal(isSafeLegalUrl('javascript:alert(1)'), false);
    assert.equal(isSafeLegalUrl(''), false);
  });
});
