/**
 * UI label dictionary. English ('en') for the launch pages, German ('de') for
 * the legal pages (Task 9). All user-facing strings live here so components
 * stay language-agnostic.
 */

export type Lang = 'en' | 'de';

export interface Dict {
  nav: {
    about: string;
    whatWeDo: string;
    philosophy: string;
    contact: string;
  };
  skipLink: string;
  navLabel: string;
  footer: {
    ariaLabel: string;
    impressum: string;
    datenschutz: string;
  };
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
    footer: {
      ariaLabel: 'Footer',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
    },
  },
  de: {
    nav: {
      about: 'Über uns',
      whatWeDo: 'Was wir tun',
      philosophy: 'Philosophie',
      contact: 'Kontakt',
    },
    skipLink: 'Zum Hauptinhalt springen',
    navLabel: 'Hauptnavigation',
    footer: {
      ariaLabel: 'Fußzeile',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
    },
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
