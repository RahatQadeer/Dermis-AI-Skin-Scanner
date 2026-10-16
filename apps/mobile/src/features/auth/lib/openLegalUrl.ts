import * as WebBrowser from 'expo-web-browser';

import { isSafeLegalUrl } from './legalUrlPolicy';

export { isSafeLegalUrl } from './legalUrlPolicy';

export async function openLegalUrl(url: string): Promise<boolean> {
  if (!isSafeLegalUrl(url)) {
    return false;
  }
  await WebBrowser.openBrowserAsync(url);
  return true;
}
