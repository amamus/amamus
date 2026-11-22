/**
 * Single source of truth for site-wide configuration.
 * - Change `siteUrl` when a custom domain is configured (base stays '/amamus/' on GitHub Pages;
 *   if a custom domain serves the site at the root, change `base` to '/' as well).
 * - Set `contact.email` to a verified address before publishing; while empty, the Contact
 *   section renders a clearly non-working placeholder state (publication blocker).
 */
export interface SiteConfig {
  siteUrl: string;
  base: string;
  lang: 'en';
  name: string;
  tagline: string;
  description: string;
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
  contact: { email: null }, // PUBLICATION BLOCKER: set a verified email before launch
  legal: { impressumPublished: false, privacyPublished: false }, // both pages contain PUBLICATION BLOCKER markers
};
