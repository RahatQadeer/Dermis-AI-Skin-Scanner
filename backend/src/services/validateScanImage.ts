import { HttpError } from '../http/HttpError';
import { MAX_SCAN_IMAGE_BYTES } from '../schemas/createScan';

export function decodeAndValidateImage(imageBase64: string, contentType: string): Uint8Array {
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(Buffer.from(imageBase64, 'base64'));
  } catch {
    throw new HttpError(400, 'invalid_image_encoding');
  }

  if (bytes.byteLength < 32) {
    throw new HttpError(400, 'image_too_small');
  }
  if (bytes.byteLength > MAX_SCAN_IMAGE_BYTES) {
    throw new HttpError(400, 'image_too_large');
  }
  if (!contentType.startsWith('image/')) {
    throw new HttpError(400, 'invalid_content_type');
  }

  return bytes;
}
