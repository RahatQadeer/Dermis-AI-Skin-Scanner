import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.join(here, '../..');
const repoRoot = path.join(mobileRoot, '../..');
const appJsonPath = path.join(mobileRoot, 'app.json');
const mobilePkgPath = path.join(mobileRoot, 'package.json');
const rnVersionsPath = path.join(repoRoot, 'node_modules/react-native/gradle/libs.versions.toml');

type AppJson = {
  expo: {
    android?: {
      predictiveBackGestureEnabled?: boolean;
    };
  };
};

type MobilePkg = {
  dependencies?: Record<string, string>;
};

function parseTomlVersion(toml: string, key: string): string | null {
  const match = toml.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, 'm'));
  return match?.[1] ?? null;
}

describe('Android compliance (DERM-067)', () => {
  it('enables predictive back in app.json', () => {
    const app = JSON.parse(readFileSync(appJsonPath, 'utf8')) as AppJson;
    assert.equal(app.expo.android?.predictiveBackGestureEnabled, true);
  });

  it('ships Expo 58 + RN 0.88 (API 36+ toolchain path)', () => {
    const pkg = JSON.parse(readFileSync(mobilePkgPath, 'utf8')) as MobilePkg;
    const expo = pkg.dependencies?.expo ?? '';
    const rn = pkg.dependencies?.['react-native'] ?? '';
    assert.match(expo, /(?:~|\^)?58\./);
    assert.match(rn, /0\.88\./);
  });

  it('RN gradle catalog targets compile/target SDK 36+', () => {
    const toml = readFileSync(rnVersionsPath, 'utf8');
    const targetSdk = Number(parseTomlVersion(toml, 'targetSdk'));
    const compileSdk = Number(parseTomlVersion(toml, 'compileSdk'));
    assert.ok(Number.isFinite(targetSdk) && targetSdk >= 36, `targetSdk=${targetSdk}`);
    assert.ok(Number.isFinite(compileSdk) && compileSdk >= 36, `compileSdk=${compileSdk}`);
  });
});
