import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  MAX_SCAN_IMAGE_BYTES,
  MIN_SCAN_EDGE_PX,
  TARGET_SCAN_WIDTH_PX,
} from '../features/scan/lib/scanImageLimits';

const mobileRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const layoutPath = path.join(mobileRoot, 'app/_layout.tsx');
const pkgPath = path.join(mobileRoot, 'package.json');

const REDUCE_MOTION_FILES = [
  'src/components/Toast.tsx',
  'src/components/Skeleton.tsx',
  'src/features/scan/components/FlashOverlay.tsx',
  'src/components/mascot/useMascotMotion.ts',
  'src/features/onboarding/components/SummaryConfetti.tsx',
  'src/features/onboarding/components/WelcomeScanOverlay.tsx',
  'src/features/onboarding/components/WelcomeScanDot.tsx',
  'src/features/onboarding/components/WelcomeScoreChip.tsx',
  'src/components/mascot/SheepHand.tsx',
] as const;

describe('performance / crash-free (DERM-070)', () => {
  it('root layout exports custom ErrorBoundary and loads Reanimated first', () => {
    const layout = readFileSync(layoutPath, 'utf8');
    assert.match(layout, /import 'react-native-reanimated'/);
    assert.match(layout, /RootErrorBoundary/);
    assert.match(layout, /export \{ RootErrorBoundary as ErrorBoundary \}/);
    assert.doesNotMatch(layout, /export \{ ErrorBoundary \} from 'expo-router'/);
  });

  it('does not ship a crash SDK until a dedicated ticket + data-safety update', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of Object.keys(deps)) {
      assert.ok(!name.startsWith('@sentry/'), `unexpected Sentry package: ${name}`);
      assert.notEqual(name, 'sentry-expo');
    }
  });

  it('keeps scan image size caps aligned with server memory budget', () => {
    assert.equal(MAX_SCAN_IMAGE_BYTES, 8 * 1024 * 1024);
    assert.equal(TARGET_SCAN_WIDTH_PX, 1280);
    assert.equal(MIN_SCAN_EDGE_PX, 480);
  });

  it('animated surfaces honour reduce-motion', () => {
    for (const rel of REDUCE_MOTION_FILES) {
      const text = readFileSync(path.join(mobileRoot, rel), 'utf8');
      assert.match(text, /useReduceMotion/, rel);
    }
  });

  it('Screen scroll path enables removeClippedSubviews', () => {
    const screen = readFileSync(path.join(mobileRoot, 'src/components/layout/Screen.tsx'), 'utf8');
    assert.match(screen, /removeClippedSubviews/);
  });
});
