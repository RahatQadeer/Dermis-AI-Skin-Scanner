import { useEffect, useRef, useState } from 'react';

import { getCopy } from '@/src/copy';

import type { ResolvedMascotProps } from './mascotProps';
import {
  defaultMotionForMood,
  MASCOT_WALK_ON_TAP_MS,
  type MascotCharacter,
  type MascotMotionKind,
} from './mascotTypes';
import { useMascotMotion } from './useMascotMotion';
import { useSafeOverlayBubble } from './useSafeOverlayBubble';

function resolveLines(lines: readonly string[] | undefined): readonly string[] {
  if (lines && lines.length > 0) {
    return lines;
  }
  return getCopy().mascot.dermis.welcomeLines;
}

function resolveA11yLabel(
  character: MascotCharacter,
  accessibilityLabel: string | undefined,
): string {
  if (accessibilityLabel) {
    return accessibilityLabel;
  }
  const copy = getCopy();
  return character === 'dermis'
    ? copy.mascot.dermis.tapHint
    : copy.mascot.placeholders.professorTapHint;
}

function useLineIndex(
  lineIndex: number | undefined,
  onLineChange: ((index: number) => void) | undefined,
  lineCount: number,
  revealOnTap: boolean,
) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [revealed, setRevealed] = useState(!revealOnTap);
  const index = lineIndex ?? internalIndex;

  const advance = () => {
    if (!revealed) {
      setRevealed(true);
      onLineChange?.(index);
      return;
    }
    const next = (index + 1) % lineCount;
    if (lineIndex === undefined) {
      setInternalIndex(next);
    }
    onLineChange?.(next);
  };

  return { index, advance, revealed };
}

function useWalkOnTap(enabled: boolean, idleKind: MascotMotionKind) {
  const [walking, setWalking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerWalk = () => {
    if (!enabled || idleKind === 'walk' || idleKind === 'none') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setWalking(true);
    timerRef.current = setTimeout(() => {
      setWalking(false);
      timerRef.current = null;
    }, MASCOT_WALK_ON_TAP_MS);
  };

  return {
    kind: walking ? ('walk' as const) : idleKind,
    triggerWalk,
  };
}

/** Line cycling, walk-on-tap, motion and overlay-bubble state for `Mascot`. */
export function useMascotController(props: ResolvedMascotProps) {
  const { character, mood, lines, lineIndex, onLineChange, showBubble } = props;
  const resolvedLines = resolveLines(lines);
  const { index, advance, revealed } = useLineIndex(
    lineIndex,
    onLineChange,
    resolvedLines.length,
    props.revealOnTap,
  );
  const message = resolvedLines[index % resolvedLines.length] ?? '';
  const idleKind = props.motionKind ?? defaultMotionForMood(mood);
  const { kind, triggerWalk } = useWalkOnTap(props.walkOnTap, idleKind);
  const { style: motionStyle } = useMascotMotion(kind);
  const overlay = useSafeOverlayBubble(props.bubbleOverlay);

  const onPress = () => {
    overlay.measure();
    triggerWalk();
    advance();
  };

  return {
    message,
    motionStyle,
    overlay,
    onPress,
    a11y: resolveA11yLabel(character, props.accessibilityLabel),
    bubbleVisible: Boolean(showBubble && revealed && message),
  };
}
