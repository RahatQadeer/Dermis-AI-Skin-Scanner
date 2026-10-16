/**
 * Semantic colour tokens. Hex values live only in this file.
 * Light theme now; structure allows a dark theme later.
 * Text/UI pairs tuned for WCAG AA where used as body/caption copy (DERM-066).
 */
export const colors = {
  ink: '#2F3A2C',
  background: '#E6EEDF',
  /** Welcome hero mint (prototype #DCEBD3). */
  hero: '#DCEBD3',
  /** Lower Welcome / soft cream plane (prototype #F3F6EE). */
  cream: '#F3F6EE',
  /** Peach highlight behind “Know” on Welcome. */
  knowHighlight: '#F3D2BC',
  surface: '#FFFFFF',
  /** Interactive / brand pink — AA on surface (≥4.5:1). */
  pink: '#B84D66',
  /** Soft pink fills (CTA tile, scan line) — not for small body text. */
  pinkBright: '#E9849A',
  /** Profile summary sensitivity note fill (prototype #FCE8EC). */
  noteSoft: '#FCE8EC',
  /** Summary answer row divider (prototype #EEF2EA). */
  rowDivider: '#EEF2EA',
  /** Summary confetti dots (prototype palette). */
  confettiMint: '#9ED8A8',
  confettiAmber: '#F6C26B',
  confettiSky: '#9FD3F0',
  /** Professor Puff illustration only. */
  professorSkin: '#F1C7A3',
  professorCardigan: '#6F8A5A',
  professorTrousers: '#3F3B4A',
  professorHorn: '#D9B878',
  professorBow: '#2F5D8A',
  professorBowCenter: '#25496E',
  professorButton: '#E2B64A',
  professorPocket: '#5C7549',
  professorGlasses: '#C9A24A',
  professorBook: '#C0563F',
  professorBookPage: '#F4ECD8',
  professorMouth: '#E98A9C',
  /** Mascot / brand-mark wool + blush (illustration only). */
  sheepWool: '#5D4B46',
  sheepOutline: '#3A2D2A',
  sheepBlush: '#F6A8B8',
  /** Fill + selected control green — white label AA on this fill. */
  green: '#45804F',
  /** Soft green hill under Welcome hero (prototype #C4DCB6). */
  hill: '#C4DCB6',
  /** Results Professor note panel (prototype dark green). */
  professorNoteBg: '#2B3A2B',
  /** Results Professor note eyebrow. */
  professorNoteEyebrow: '#D4B8C8',
  /** Selected zone marker glow. */
  zoneSelectedGlow: 'rgba(233, 132, 154, 0.45)',
  /** Results cream canvas (prototype #F7F7F2 ≈ cream). */
  resultsCanvas: '#F7F7F2',
  /** Soft beige zone-detail card. */
  zoneDetailBg: '#F0EBE3',
  /** Zone-map face fill (prototype light gray oval). */
  zoneFaceFill: '#E4E4DE',
  /** Soft cheek shade on zone face. */
  zoneFaceShade: '#D8D8D0',
  /** Faint face contour lines on zone map. */
  zoneFaceLine: '#C8C8C0',
  /** Headline accent pink (prototype #D96C86). */
  pinkAccent: '#D96C86',
  /** Soft score chip fill (hydration). */
  greenSoft: '#E3F0DC',
  /** Score number on hydration chip. */
  greenDeep: '#3F7D4B',
  sky: '#6FA8C9',
  amber: '#E8A94B',
  /** Soft score chip fill (pores). */
  amberSoft: '#FDF1DC',
  /** Score number on amber chip. */
  amberDeep: '#A86F1A',
  /** Soft wool shade under sheep belly. */
  sheepShade: '#ECEFF4',
  /** Inner ear pink. */
  sheepEar: '#F3B9C4',
  /** Hoof. */
  sheepHoof: '#4A3B37',
  red: '#D4605A',
  /** Secondary body/caption on background/surface — AA. */
  mute: '#5E6D59',
  border: '#D5E0D0',
  /** Welcome Log in pill border (prototype #CFDCC8). */
  borderMuted: '#CFDCC8',
  /** Stat card subtitle (prototype #61705C). */
  muteSoft: '#61705C',
  /** Welcome subcopy (prototype #4C5A48). */
  muteBody: '#4C5A48',
  /** Welcome footnote (prototype #8A9885). */
  muteFoot: '#8A9885',
  /** Quiz progress track (prototype #E1E9DA). */
  quizTrack: '#E1E9DA',
  /** Quiz Continue disabled fill (prototype #DCE6D5). */
  quizContinueDisabled: '#DCE6D5',
  /** Quiz “QUESTION N” eyebrow (prototype #B9506A). */
  quizEyebrow: '#B9506A',
  /** Tertiary caption — AA on background/surface. */
  inkMuted: '#5F6E5A',
  overlay: 'rgba(47, 58, 44, 0.4)',
  /** External brand marks (logos only — fixed by the vendor). */
  googleBlue: '#4285F4',
  googleGreen: '#34A853',
  googleYellow: '#FBBC05',
  googleRed: '#EA4335',
  /** Fitzpatrick skin-tone swatches (quiz Q2 illustration only). */
  fitzpatrickFair: '#F3DCC9',
  fitzpatrickLight: '#E2B896',
  fitzpatrickOlive: '#B98862',
  fitzpatrickDeep: '#7A4E33',
} as const;

export type ColorToken = keyof typeof colors;
