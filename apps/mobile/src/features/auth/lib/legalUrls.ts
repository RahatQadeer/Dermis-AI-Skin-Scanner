import { isHttpsUrl } from './legalUrlPolicy';

/** Public legal URLs — set in env before store submission. */
export const legalUrls = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
} as const;

export function hasLegalUrls(): boolean {
  return isHttpsUrl(legalUrls.terms) && isHttpsUrl(legalUrls.privacy);
}
