import type { SiteConfig } from '../config/site.config';

export function validateConfig(c: SiteConfig): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!/^https:\/\/[a-z0-9.-]+\/?$/i.test(c.siteUrl)) errors.push('siteUrl must be an https URL');
  if (!c.base.startsWith('/') || !c.base.endsWith('/')) errors.push('base must start and end with /');
  if (c.contact.email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.contact.email))
    errors.push('contact.email must be a valid email or null');
  if (!c.name.trim()) errors.push('name must not be empty');
  return errors.length ? { ok: false, errors } : { ok: true };
}
