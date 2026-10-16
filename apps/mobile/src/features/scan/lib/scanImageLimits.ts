/** Server max is 8 MiB raw bytes (`MAX_SCAN_IMAGE_BYTES`). */
export const MAX_SCAN_IMAGE_BYTES = 8 * 1024 * 1024;

export const MIN_SCAN_EDGE_PX = 480;

export const TARGET_SCAN_WIDTH_PX = 1280;

export function base64DecodedByteLength(base64: string): number {
  const normalized = base64.replace(/\s/g, '');
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

export function isWithinScanSizeLimit(base64: string): boolean {
  return base64DecodedByteLength(base64) <= MAX_SCAN_IMAGE_BYTES;
}
