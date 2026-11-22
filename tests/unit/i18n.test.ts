import { describe, expect, it } from 'vitest';
import { dict, t } from '../../src/config/i18n';

describe('dict.en.nav', () => {
  it('has exactly the keys about/whatWeDo/philosophy/contact with the English values', () => {
    expect(Object.keys(dict.en.nav).sort()).toEqual(['about', 'contact', 'philosophy', 'whatWeDo']);
    expect(dict.en.nav).toEqual({
      about: 'About',
      whatWeDo: 'What we do',
      philosophy: 'Philosophy',
      contact: 'Contact',
    });
  });
});

describe('t', () => {
  it('resolves dotted keys', () => {
    expect(t('en', 'nav.about')).toBe('About');
    expect(t('en', 'nav.whatWeDo')).toBe('What we do');
    expect(t('en', 'nav.philosophy')).toBe('Philosophy');
    expect(t('en', 'nav.contact')).toBe('Contact');
  });
});

describe('dict integrity', () => {
  it('has no empty strings anywhere in dict.en', () => {
    const walk = (v: unknown): string[] =>
      typeof v === 'string' ? [v] : Object.values(v as Record<string, unknown>).flatMap(walk);
    const strings = walk(dict.en);
    expect(strings.length).toBeGreaterThan(0);
    for (const s of strings) expect(s.trim().length).toBeGreaterThan(0);
  });
});
