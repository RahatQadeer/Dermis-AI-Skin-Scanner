export { copy, type CopyTree } from './catalog';
export { getCopy, getLocale, setLocale, type LocaleId } from './i18n';

/** Convenience alias for screens: `const c = useCopy()` pattern without a hook yet. */
export { getCopy as useCopyStatic } from './i18n';
