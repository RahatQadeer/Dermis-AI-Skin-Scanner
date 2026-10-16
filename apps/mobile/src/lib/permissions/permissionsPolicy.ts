/** iOS usage-description keys we intentionally ship (DERM-062). */
export const ALLOWED_USAGE_DESCRIPTION_KEYS = ['NSCameraUsageDescription'] as const;

const DISALLOWED_HINTS = [
  'NSPhotoLibrary',
  'NSMicrophone',
  'NSLocation',
  'NSContacts',
  'NSBluetooth',
  'NSFaceID',
  'NSMotion',
  'NSLocalNetwork',
  'NSUserTracking',
] as const;

export function findDisallowedPermissionHints(text: string): string | null {
  for (const hint of DISALLOWED_HINTS) {
    if (text.includes(hint)) {
      return hint;
    }
  }
  return null;
}
