/**
 * UI label dictionary. English launch (lang="en"); to add German later, add a
 * 'de' entry to `dict` and widen `Lang` — no new dependencies needed.
 * All user-facing strings live here so components stay language-agnostic.
 */

export type Lang = 'en';

export interface Dict {
  nav: {
    about: string;
    whatWeDo: string;
    philosophy: string;
    contact: string;
  };
  skipLink: string;
  navLabel: string;
}

export const dict: Record<Lang, Dict> = {
  en: {
    nav: {
      about: 'About',
      whatWeDo: 'What we do',
      philosophy: 'Philosophy',
      contact: 'Contact',
    },
    skipLink: 'Skip to main content',
    navLabel: 'Main',
  },
};

/** Resolve a dotted key like 'nav.about' for `lang`. Throws on unknown keys. */
export function t(lang: Lang, key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], dict[lang]);
  if (typeof value !== 'string') {
    throw new Error(`Missing i18n key "${key}" for lang "${lang}"`);
  }
  return value;
}
