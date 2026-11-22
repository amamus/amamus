import { siteConfig } from '../config/site.config';

/**
 * URL helpers. All internal URLs on the site MUST go through these functions
 * so the GitHub Pages base ('/amamus/') is applied exactly once — never
 * hard-code the base anywhere else.
 */

function normalizeBase(base: string): string {
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * Prefix `path` with `base` (defaults to `siteConfig.base`).
 * - Idempotent: a path that already starts with `base` is returned unchanged.
 * - Root '/' maps to the base itself.
 * - Query strings and hashes are preserved untouched.
 */
export function withBase(path: string, base: string = siteConfig.base): string {
  const b = normalizeBase(base);
  if (!path || path === '/') return b;
  if (path.startsWith(b)) return path;
  return `${b}${path.startsWith('/') ? path.slice(1) : path}`;
}

/**
 * Build the canonical absolute URL for `path`
 * (defaults: `siteConfig.siteUrl` + `siteConfig.base`).
 */
export function absoluteUrl(
  path: string,
  siteUrl: string = siteConfig.siteUrl,
  base: string = siteConfig.base
): string {
  const origin = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  return `${origin}${withBase(path, base)}`;
}
