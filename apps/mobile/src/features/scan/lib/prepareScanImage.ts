import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { isWithinScanSizeLimit, MIN_SCAN_EDGE_PX, TARGET_SCAN_WIDTH_PX } from './scanImageLimits';

export type PreparedScanImage = {
  base64: string;
  contentType: 'image/jpeg';
  width: number;
  height: number;
};

export class ScanImageError extends Error {
  readonly code: 'too_small' | 'too_large' | 'prepare_failed';

  constructor(code: ScanImageError['code']) {
    super(code);
    this.name = 'ScanImageError';
    this.code = code;
  }
}

export async function prepareScanImage(uri: string): Promise<PreparedScanImage> {
  let quality = 0.85;
  let lastWidth = 0;
  let lastHeight = 0;
  let base64 = '';

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const result = await manipulateAsync(uri, [{ resize: { width: TARGET_SCAN_WIDTH_PX } }], {
        compress: quality,
        format: SaveFormat.JPEG,
        base64: true,
      });
      lastWidth = result.width;
      lastHeight = result.height;
      base64 = result.base64 ?? '';
    } catch {
      throw new ScanImageError('prepare_failed');
    }
    if (!base64) {
      throw new ScanImageError('prepare_failed');
    }
    // Front-camera crops can be tall/narrow — only reject if both edges are tiny.
    if (lastWidth < MIN_SCAN_EDGE_PX && lastHeight < MIN_SCAN_EDGE_PX) {
      throw new ScanImageError('too_small');
    }
    if (isWithinScanSizeLimit(base64)) {
      return { base64, contentType: 'image/jpeg', width: lastWidth, height: lastHeight };
    }
    quality -= 0.15;
  }
  throw new ScanImageError('too_large');
}
