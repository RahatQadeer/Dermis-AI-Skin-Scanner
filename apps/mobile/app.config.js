/* global __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Expo app.config is CommonJS */
const fs = require('node:fs');
const path = require('node:path');

/**
 * Expo only auto-loads `.env*` under apps/mobile. Also pull EXPO_PUBLIC_*
 * from the monorepo root `.env.local` so one secrets file can drive both.
 */
function parseExpoPublicEntry(trimmed) {
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }
  const eq = trimmed.indexOf('=');
  if (eq <= 0) {
    return null;
  }
  const key = trimmed.slice(0, eq).trim();
  if (!key.startsWith('EXPO_PUBLIC_')) {
    return null;
  }
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function loadExpoPublicFrom(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const entry = parseExpoPublicEntry(line.trim());
    if (!entry) {
      continue;
    }
    if (process.env[entry.key] === undefined || process.env[entry.key] === '') {
      process.env[entry.key] = entry.value;
    }
  }
}

loadExpoPublicFrom(path.resolve(__dirname, '../../.env.local'));
loadExpoPublicFrom(path.resolve(__dirname, '.env.local'));

module.exports = require('./app.json');
