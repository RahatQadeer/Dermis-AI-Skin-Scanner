/**
 * i18n hook point — today returns the default English tree.
 * Replace `getCopy()` implementation when adding locales.
 */
import { copy, type CopyTree } from './catalog';

export type LocaleId = 'en';

const locales: Record<LocaleId, CopyTree> = {
  en: copy,
};

let activeLocale: LocaleId = 'en';

export function setLocale(locale: LocaleId): void {
  activeLocale = locale;
}

export function getLocale(): LocaleId {
  return activeLocale;
}

/** Returns the active locale copy tree. */
export function getCopy(): CopyTree {
  return locales[activeLocale];
}
