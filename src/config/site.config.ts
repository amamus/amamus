/**
 * Single source of truth for site-wide configuration.
 * - Change `siteUrl` when a custom domain is configured (base stays '/amamus/' on GitHub Pages;
 *   if a custom domain serves the site at the root, change `base` to '/' as well).
 * - If `contact.email` is ever set back to `null`, the Contact section renders a
 *   clearly non-working placeholder state (publication blocker) instead of a contact.
 */
export interface SiteConfig {
  siteUrl: string;
  base: string;
  lang: 'en';
  name: string;
  tagline: string;
  description: string;
  brand: { themeColor: string };
  contact: { email: string | null };
  legal: { impressumPublished: boolean; privacyPublished: boolean };
}

export const siteConfig: SiteConfig = {
  siteUrl: 'https://amamus.github.io',
  base: '/amamus/',
  lang: 'en',
  name: 'amamus iocum',
  tagline: 'Take the future seriously. Enjoy the journey.',
  description:
    'amamus iocum builds digital products, invests in promising ideas, and thinks ahead — for more freedom to enjoy life.',
  // Raw brand hex is allowed here (TS config files are not scanned by the
  // styles test); it backs the <meta name="theme-color"> in BaseLayout.
  brand: { themeColor: '#0A2463' },
  // Verified contact address provided by the owner on 2026-11-22.
  contact: { email: 'postmaster@amamus.net' },
  // Still drafts: some Impressum fields are null (PUBLICATION BLOCKER markers)
  // and the Datenschutzerklärung has TEMPLATE sections pending legal review.
  legal: { impressumPublished: false, privacyPublished: false },
};
