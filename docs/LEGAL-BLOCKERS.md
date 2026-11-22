# Publication blockers — legal and contact information

**Rule:** the site must **not** be presented as legally complete (or as a finished publication) until every blocker below is resolved. The markers are intentionally visible: fields that are missing render as a sun-colored `PUBLICATION BLOCKER` banner (`src/components/LegalBlocker.astro`), and each legal page shows a draft notice at the top. Never paper over missing legal data with invented values — fill in verified data instead.

Mechanism: `src/utils/legal.ts` (`legalField()`) classifies every required field; `null`, `undefined`, or whitespace-only counts as missing. The pages `src/pages/impressum.astro` and `src/pages/datenschutz.astro` render a `<LegalBlocker />` for each missing field.

## Blocker 1 — Contact email (home page) — RESOLVED 2026-11-22

- `contact.email` in [`src/config/site.config.ts`](../src/config/site.config.ts) is now set to the owner-provided, verified address **`postmaster@amamus.net`**. The Contact section (`src/components/Contact.astro`) renders a working `mailto:postmaster@amamus.net` button; the placeholder state only appears if the value is set back to `null` (covered by `tests/e2e/contact.spec.ts` and `tests/build/buildOutput.test.ts`, which branch on the configured value). `src/utils/validateConfig.ts` validates the format (must be a valid email or `null`).

## Blocker 2 — Impressum: 6 of 9 required fields still missing (PARTIALLY RESOLVED 2026-11-22)

- **Where:** frontmatter of [`src/content/legal/impressum.md`](../src/content/legal/impressum.md). Filled with owner-provided data on 2026-11-22:
  - **Anschrift** = `Weserstr. 44d, 10247 Berlin, Germany`
  - **Kontakt** = `postmaster@amamus.net` (kept in sync with `contact.email` by test)
  - **Verantwortlich nach § 18 Abs. 2 MStV** = `David Walter, Weserstr. 44d, 10247 Berlin, Germany`
- Still `value: null` and rendering as a `PUBLICATION BLOCKER` marker on `/amamus/impressum/` (the owner completes these personally):
  - Section *Angaben gemäß § 5 TMG*: **Name**, **Rechtsform**, **Vertretungsberechtigte Person**, **Registergericht**, **Registernummer**
  - Section *Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG*: **USt-IdNr.**
- **Fix:** replace each remaining `value: null` with the verified, actual data in the frontmatter of `src/content/legal/impressum.md`. Once the page is complete and reviewed, set `legal.impressumPublished: true` in `src/config/site.config.ts`. `tests/unit/legalContent.test.ts` pins the provided values and enforces that all other fields stay `null` (nothing may be invented); `tests/build/buildOutput.test.ts` asserts the marker count equals the number of null fields.

## Blocker 3 — Datenschutzerklärung: draft pending qualified legal review

- **Where:** frontmatter of [`src/content/legal/datenschutz.md`](../src/content/legal/datenschutz.md) — the page has no null fields, but two sections are marked `TEMPLATE — fachkundige rechtliche Prüfung erforderlich` and must be completed by qualified legal counsel before publication:
  - **Kontaktaufnahme** (legal basis, storage duration, recipients for email inquiries)
  - **Ihre Rechte** (data-subject rights: access, rectification, erasure, restriction, portability, objection, complaint to a supervisory authority)
- The page also carries a visible draft banner ("Entwurf — wird derzeit fachkundig geprüft …").
- **Fix:** have the prose reviewed and completed in `src/content/legal/datenschutz.md`, then set `legal.privacyPublished: true` in `src/config/site.config.ts`. The sections that state facts about this site (GitHub Pages hosting, no cookies/analytics/trackers, no external services, self-hosted fonts) are already accurate — see [PRIVACY.md](PRIVACY.md).

## Current state

`src/config/site.config.ts` sets `contact.email: 'postmaster@amamus.net'`, `legal.impressumPublished: false`, and `legal.privacyPublished: false`. The pages `/amamus/impressum/` and `/amamus/datenschutz/` are reachable but show the draft banner, and the Impressum still shows 6 blocker markers — that is deliberate and must remain so until the remaining real data is in place.
