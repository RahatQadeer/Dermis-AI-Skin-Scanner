import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { findBannedClaim } from '../copy/claimsAudit';
import { complianceCopy } from '../copy/compliance';

const mobileRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.join(mobileRoot, '../..');
const imagesDir = path.join(mobileRoot, 'assets/images');
const appJsonPath = path.join(mobileRoot, 'app.json');
const listingDraftPath = path.join(repoRoot, 'docs/store/listing-copy.draft.md');

type AppJson = {
  expo: {
    icon?: string;
    android?: { adaptiveIcon?: Record<string, string> };
    plugins?: unknown[];
  };
};

function pngSize(filePath: string): { width: number; height: number } {
  const buf = readFileSync(filePath);
  assert.equal(buf.toString('ascii', 1, 4), 'PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function resolveAsset(relativeFromAppJson: string): string {
  return path.join(mobileRoot, relativeFromAppJson.replace(/^\.\//, ''));
}

describe('store assets (DERM-069)', () => {
  it('app.json icon and adaptive icons exist with required dimensions', () => {
    const app = JSON.parse(readFileSync(appJsonPath, 'utf8')) as AppJson;
    assert.ok(app.expo.icon);
    const iconPath = resolveAsset(app.expo.icon!);
    assert.equal(existsSync(iconPath), true);
    assert.deepEqual(pngSize(iconPath), { width: 1024, height: 1024 });

    const adaptive = app.expo.android?.adaptiveIcon;
    assert.ok(adaptive?.foregroundImage);
    assert.ok(adaptive?.backgroundImage);
    assert.deepEqual(pngSize(resolveAsset(adaptive!.foregroundImage!)), {
      width: 512,
      height: 512,
    });
    assert.deepEqual(pngSize(resolveAsset(adaptive!.backgroundImage!)), {
      width: 512,
      height: 512,
    });

    const splash = path.join(imagesDir, 'splash-icon.png');
    assert.equal(existsSync(splash), true);
    assert.deepEqual(pngSize(splash), { width: 1024, height: 1024 });
  });

  it('store listing helper copy stays non-empty and D4-clean', () => {
    for (const key of [
      'storeListingNotMedicalDevice',
      'storeListingWellnessEstimates',
      'consultProfessional',
    ] as const) {
      const value = complianceCopy[key];
      assert.ok(value.trim().length > 0, key);
      assert.equal(findBannedClaim(value), null, key);
    }
  });

  it('listing draft exists and has no banned claim substrings', () => {
    assert.equal(existsSync(listingDraftPath), true);
    const text = readFileSync(listingDraftPath, 'utf8');
    assert.equal(findBannedClaim(text), null);
  });

  it('store doc pack folders exist', () => {
    for (const rel of [
      'docs/store/README.md',
      'docs/store/screenshot-guide.md',
      'docs/store/demo-account.template.md',
      'docs/store/public-urls.md',
      'docs/store/ios',
      'docs/store/android',
      'docs/product/store-readiness-audit.md',
    ]) {
      assert.equal(existsSync(path.join(repoRoot, rel)), true, rel);
    }
  });
});
