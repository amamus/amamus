import { describe, expect, it } from 'vitest';
import { withBase, absoluteUrl } from '../../src/utils/paths';
import { siteConfig } from '../../src/config/site.config';

describe('withBase', () => {
  it('joins base and path', () => {
    expect(withBase('/', '/amamus/')).toBe('/amamus/');
    expect(withBase('/impressum/', '/amamus/')).toBe('/amamus/impressum/');
    expect(withBase('impressum/', '/amamus/')).toBe('/amamus/impressum/');
    expect(withBase('/amamus/impressum/', '/amamus/')).toBe('/amamus/impressum/'); // already-based paths are NOT double-prefixed (idempotent)
  });
  it('uses siteConfig base by default', () => {
    expect(withBase('/datenschutz/')).toBe(`${siteConfig.base}datenschutz/`);
  });
  it('handles query strings and hashes', () => {
    expect(withBase('/x/?a=1#h', '/amamus/')).toBe('/amamus/x/?a=1#h');
  });
});

describe('absoluteUrl', () => {
  it('builds canonical absolute URL', () => {
    expect(absoluteUrl('/impressum/', 'https://amamus.github.io', '/amamus/')).toBe(
      'https://amamus.github.io/amamus/impressum/'
    );
    expect(absoluteUrl('/', 'https://amamus.github.io/', '/amamus/')).toBe('https://amamus.github.io/amamus/');
  });
  it('defaults to siteConfig', () => {
    expect(absoluteUrl('/')).toBe('https://amamus.github.io/amamus/');
  });
});
