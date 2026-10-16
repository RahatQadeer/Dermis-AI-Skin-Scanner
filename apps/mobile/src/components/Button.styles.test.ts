import assert from 'node:assert/strict';
import test from 'node:test';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { resolveButtonVisual } from './Button.styles';

test('primary button uses green fill and white text', () => {
  const visual = resolveButtonVisual({
    variant: 'primary',
    size: 'md',
    disabled: false,
  });
  assert.equal(visual.backgroundColor, colors.green);
  assert.equal(visual.textColor, colors.surface);
  assert.equal(visual.minHeight, 44);
});

test('disabled button reduces opacity', () => {
  const visual = resolveButtonVisual({
    variant: 'ghost',
    size: 'lg',
    disabled: true,
  });
  assert.equal(visual.opacity, 0.45);
  assert.equal(visual.minHeight, spacing.huge);
});

test('danger variant uses red', () => {
  const visual = resolveButtonVisual({
    variant: 'danger',
    size: 'md',
    disabled: false,
  });
  assert.equal(visual.backgroundColor, colors.red);
});

test('outline variant is transparent with green border', () => {
  const visual = resolveButtonVisual({
    variant: 'outline',
    size: 'lg',
    disabled: false,
  });
  assert.equal(visual.backgroundColor, 'transparent');
  assert.equal(visual.borderColor, colors.green);
  assert.equal(visual.textColor, colors.green);
  assert.ok(visual.borderWidth >= 1);
});
