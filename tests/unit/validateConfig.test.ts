import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site.config';
import { validateConfig } from '../../src/utils/validateConfig';

describe('validateConfig', () => {
  it('accepts the shipped site config', () => {
    expect(validateConfig(siteConfig)).toEqual({ ok: true });
  });
  it('rejects a non-https siteUrl', () => {
    const r = validateConfig({ ...siteConfig, siteUrl: 'http://example.com' });
    expect(r.ok).toBe(false);
  });
  it('rejects a base without slashes', () => {
    expect(validateConfig({ ...siteConfig, base: 'amamus' }).ok).toBe(false);
  });
  it('rejects an invalid contact email but accepts null', () => {
    expect(validateConfig({ ...siteConfig, contact: { email: 'nope' } }).ok).toBe(false);
    expect(validateConfig({ ...siteConfig, contact: { email: null } }).ok).toBe(true);
    expect(validateConfig({ ...siteConfig, contact: { email: 'hello@example.com' } }).ok).toBe(true);
  });
});
