import { siteConfig } from '../config/site.config';
import { absoluteUrl } from './paths';

/**
 * SEO helpers. Structured data is emitted as schema.org microdata in the
 * markup (see BaseLayout), not as a JSON-LD script tag, so the CSP below can
 * stay strict (no 'unsafe-inline').
 */

/** `<title>` content: brand name alone, or "Page · amamus iocum". */
export function pageTitle(title: string | undefined): string {
  return title ? `${title} · ${siteConfig.name}` : siteConfig.name;
}

/** Canonical absolute URL for an internal path. */
export function canonical(path: string): string {
  return absoluteUrl(path);
}

/** Absolute URL of the Open Graph image (public/og-image.png). */
export function ogImageUrl(): string {
  return absoluteUrl('/og-image.png');
}

/**
 * Strict Content-Security-Policy delivered via <meta> (GitHub Pages cannot
 * set CSP headers). Requires all CSS external (build.inlineStylesheets:
 * 'never') and all scripts hoisted/bundled (Astro default). No analytics,
 * no cookies, no external requests — fonts are self-hosted.
 */
export const CSP_POLICY =
  "default-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
