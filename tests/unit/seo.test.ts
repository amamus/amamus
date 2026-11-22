import { describe, expect, it } from 'vitest';
import { pageTitle, canonical, ogImageUrl, CSP_POLICY } from '../../src/utils/seo';

describe('pageTitle', () => {
  it('falls back to the brand name for undefined', () => {
    expect(pageTitle(undefined)).toBe('amamus iocum');
  });
  it('appends the brand name after the page title', () => {
    expect(pageTitle('Impressum')).toBe('Impressum · amamus iocum');
  });
});

describe('canonical', () => {
  it('builds the absolute canonical URL for a path', () => {
    expect(canonical('/impressum/')).toBe('https://amamus.github.io/amamus/impressum/');
  });
});

describe('ogImageUrl', () => {
  it('points at the base-prefixed og-image', () => {
    expect(ogImageUrl().endsWith('/amamus/og-image.png')).toBe(true);
  });
});

describe('CSP_POLICY', () => {
  it('equals the strict policy from the global constraints', () => {
    expect(CSP_POLICY).toBe(
      "default-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    );
  });
});
