# Privacy — what this site does (and does not do)

**This website collects no personal data.** It has no analytics, no trackers, no cookies, no advertising, and no contact forms. There is nothing on the site that measures reach, builds usage profiles, or loads anything from third parties.

This is not just a claim — it is enforced technically and covered by an automated test:

- **No external requests.** `tests/e2e/noExternalRequests.spec.ts` loads every route (`/amamus/`, `/amamus/impressum/`, `/amamus/datenschutz/`, `/amamus/404.html`) in a real browser and fails if any request goes to a host other than localhost. Evidence from the latest runs is committed under [`verification/`](verification/README.md).
- **Self-hosted fonts.** The typefaces (Inter Variable, Nunito Sans Variable) ship with the site via the `@fontsource-variable/*` packages and are served from the site itself (`font-src 'self'`, preloaded as woff2). No Google Fonts or other font CDN is used.
- **Strict Content Security Policy.** GitHub Pages cannot set HTTP response headers, so the CSP is delivered as a `<meta http-equiv="Content-Security-Policy">` tag in every page (`src/layouts/BaseLayout.astro`, policy in `src/utils/seo.ts`):

  ```
  default-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self';
  style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self';
  frame-ancestors 'none'
  ```

  No `'unsafe-inline'`, no external origins, no framing. Structured data is emitted as schema.org microdata in the markup rather than a JSON-LD script, which is what allows the CSP to stay this strict. The build never inlines stylesheets or assets (`astro.config.mjs`) so the policy holds.

## Hosting note

The site is hosted on **GitHub Pages** (provider: GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). When pages are delivered, the hosting provider processes technically necessary connection data (e.g., IP address, time of access) to serve the website. For how GitHub handles data, see the [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).

## Contact

There is currently no working contact channel on the site (the contact email is a publication blocker — see [LEGAL-BLOCKERS.md](LEGAL-BLOCKERS.md)). Once a verified email address is configured, inquiries sent to it are processed solely to answer the inquiry; the corresponding section of the German privacy notice (`src/content/legal/datenschutz.md`, "Kontaktaufnahme") is still a template pending qualified legal review before publication.

The user-facing privacy notice lives at `/amamus/datenschutz/` (source: `src/content/legal/datenschutz.md`); it currently states only facts that are true of this site and is marked as a draft.
