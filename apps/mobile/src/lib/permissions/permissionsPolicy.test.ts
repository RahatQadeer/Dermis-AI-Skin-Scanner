import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ALLOWED_USAGE_DESCRIPTION_KEYS, findDisallowedPermissionHints } from './permissionsPolicy';

const appJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../app.json');

describe('permissions policy (DERM-062)', () => {
  it('app.json only declares camera usage description on iOS', () => {
    const app = JSON.parse(readFileSync(appJsonPath, 'utf8')) as {
      expo: { ios?: { infoPlist?: Record<string, unknown> } };
    };
    const info = app.expo.ios?.infoPlist ?? {};
    const usageKeys = Object.keys(info).filter(
      (key) => key.startsWith('NS') && key.includes('Usage'),
    );
    assert.deepEqual(usageKeys.sort(), [...ALLOWED_USAGE_DESCRIPTION_KEYS].sort());
  });

  it('camera plugin disables mic / audio / barcode extras', () => {
    const app = JSON.parse(readFileSync(appJsonPath, 'utf8')) as {
      expo: { plugins: unknown[] };
    };
    const camera = app.expo.plugins.find(
      (entry) => Array.isArray(entry) && entry[0] === 'expo-camera',
    ) as [string, Record<string, unknown>] | undefined;
    assert.ok(camera);
    assert.equal(camera[1].microphonePermission, false);
    assert.equal(camera[1].recordAudioAndroid, false);
    assert.equal(camera[1].barcodeScannerEnabled, false);
  });

  it('notifications plugin keeps remote background push off', () => {
    const app = JSON.parse(readFileSync(appJsonPath, 'utf8')) as {
      expo: { plugins: unknown[] };
    };
    const notifications = app.expo.plugins.find(
      (entry) => Array.isArray(entry) && entry[0] === 'expo-notifications',
    ) as [string, Record<string, unknown>] | undefined;
    assert.ok(notifications);
    assert.equal(notifications[1].enableBackgroundRemoteNotifications, false);
  });

  it('flags disallowed permission hint strings', () => {
    assert.ok(findDisallowedPermissionHints('NSPhotoLibraryUsageDescription'));
    assert.equal(findDisallowedPermissionHints('NSCameraUsageDescription'), null);
  });
});
