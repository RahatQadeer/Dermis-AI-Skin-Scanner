import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { colors } from '../theme/colors';
import { touchTargets } from '../theme/touchTargets';

import { contrastRatio, WCAG_AA_NORMAL } from './contrast';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Body/caption pairs that must stay AA on light theme surfaces. */
const TEXT_PAIRS: readonly { name: string; fg: string; bg: string }[] = [
  { name: 'ink on background', fg: colors.ink, bg: colors.background },
  { name: 'ink on surface', fg: colors.ink, bg: colors.surface },
  { name: 'mute on background', fg: colors.mute, bg: colors.background },
  { name: 'mute on surface', fg: colors.mute, bg: colors.surface },
  { name: 'inkMuted on background', fg: colors.inkMuted, bg: colors.background },
  { name: 'inkMuted on surface', fg: colors.inkMuted, bg: colors.surface },
  { name: 'pink (links) on surface', fg: colors.pink, bg: colors.surface },
  { name: 'white on green (selected chip)', fg: colors.surface, bg: colors.green },
];

describe('accessibility audit (DERM-066)', () => {
  it('minimum touch target is 44pt', () => {
    assert.equal(touchTargets.min, 44);
  });

  it('theme text/UI pairs meet WCAG AA (≥4.5:1)', () => {
    for (const pair of TEXT_PAIRS) {
      const ratio = contrastRatio(pair.fg, pair.bg);
      assert.ok(
        ratio >= WCAG_AA_NORMAL,
        `${pair.name}: ${ratio.toFixed(2)} < ${String(WCAG_AA_NORMAL)}`,
      );
    }
  });

  it('shared controls keep minHeight ≥ touchTargets.min', () => {
    const chip = readFileSync(path.join(root, 'components/Chip.tsx'), 'utf8');
    const segmented = readFileSync(path.join(root, 'components/SegmentedControl.tsx'), 'utf8');
    const iconButton = readFileSync(path.join(root, 'components/IconButton.tsx'), 'utf8');
    assert.match(chip, /minHeight:\s*touchTargets\.min/);
    assert.match(segmented, /minHeight:\s*touchTargets\.min/);
    assert.match(iconButton, /Math\.max\(size,\s*touchTargets\.min\)/);
  });

  it('progress primitives expose accessibilityLabel', () => {
    const ring = readFileSync(path.join(root, 'components/ProgressRing.tsx'), 'utf8');
    const bar = readFileSync(path.join(root, 'components/ScoreBar.tsx'), 'utf8');
    assert.match(ring, /accessibilityLabel=/);
    assert.match(bar, /accessibilityLabel=/);
  });
});
