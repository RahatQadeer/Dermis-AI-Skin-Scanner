import type { MascotCharacter, MascotMood, MascotMotionKind } from './mascotTypes';

export type MascotProps = {
  character?: MascotCharacter;
  mood?: MascotMood;
  /** Lines to cycle on tap. Defaults to Dermis welcome lines. */
  lines?: readonly string[];
  lineIndex?: number;
  onLineChange?: (index: number) => void;
  showBubble?: boolean;
  /**
   * Hide the bubble until the first tap, then cycle lines (Welcome-style).
   * Useful in dense layouts so tips appear on demand.
   */
  revealOnTap?: boolean;
  /**
   * Float the bubble above the sheep without growing the layout row
   * (Home / Routine / Scan detail side placements).
   */
  bubbleOverlay?: boolean;
  size?: number;
  /** Smaller speech bubble (Welcome hero). */
  compactBubble?: boolean;
  motionKind?: MascotMotionKind;
  /**
   * When true (default), a tap briefly switches motion to walk, then returns
   * to the normal mood motion (bob / hop / …).
   */
  walkOnTap?: boolean;
  accessibilityLabel?: string;
};

export type ResolvedMascotProps = Omit<
  MascotProps,
  | 'character'
  | 'mood'
  | 'showBubble'
  | 'revealOnTap'
  | 'bubbleOverlay'
  | 'size'
  | 'compactBubble'
  | 'walkOnTap'
> &
  Required<
    Pick<
      MascotProps,
      | 'character'
      | 'mood'
      | 'showBubble'
      | 'revealOnTap'
      | 'bubbleOverlay'
      | 'size'
      | 'compactBubble'
      | 'walkOnTap'
    >
  >;

/** Applies the documented prop defaults in one place. */
export function withMascotDefaults({
  character = 'dermis',
  mood = 'idle',
  showBubble = true,
  revealOnTap = false,
  bubbleOverlay = false,
  size = 112,
  compactBubble = false,
  walkOnTap = true,
  ...rest
}: MascotProps): ResolvedMascotProps {
  return {
    ...rest,
    character,
    mood,
    showBubble,
    revealOnTap,
    bubbleOverlay,
    size,
    compactBubble,
    walkOnTap,
  };
}
