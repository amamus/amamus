# Publication blockers — legal and contact information

**Rule:** the site must **not** be presented as legally complete (or as a finished publication) until every blocker below is resolved. The markers are intentionally visible: fields that are missing render as a sun-colored `PUBLICATION BLOCKER` banner (`src/components/LegalBlocker.astro`), and each legal page shows a draft notice at the top. Never paper over missing legal data with invented values — fill in verified data instead.

Mechanism: `src/utils/legal.ts` (`legalField()`) classifies every required field; `null`, `undefined`, or whitespace-only counts as missing. The pages `src/pages/impressum.astro` and `src/pages/datenschutz.astro` render a `<LegalBlocker />` for each missing field.

## Blocker 1 — Contact email (home page)

- **Where:** `contact.email` in [`src/config/site.config.ts`](../src/config/site.config.ts) — currently `null`.
- **Effect:** the Contact section (`src/components/Contact.astro`) renders a dashed-border, clearly non-working placeholder ("Our contact address is being set up and will be published here.") instead of a contact address. There is no working `mailto:` on the site in this state — do not present the placeholder as a working contact.
- **Fix:** set `contact.email` to a verified address in `src/config/site.config.ts`. The Contact section then automatically renders a working `mailto:` button. `src/utils/validateConfig.ts` validates the format (must be a valid email or `null`).

## Blocker 2 — Impressum: all required fields missing

- **Where:** frontmatter of [`src/content/legal/impressum.md`](../src/content/legal/impressum.md) — every field below has `value: null` and renders as a `PUBLICATION BLOCKER` marker on `/amamus/impressum/`:
  - Section *Angaben gemäß § 5 TMG*: **Name**, **Rechtsform**, **Anschrift**, **Vertretungsberechtigte Person**, **Kontakt**, **Registergericht**, **Registernummer**
  - Section *Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG*: **USt-IdNr.**
  - Section *Verantwortlich für den Inhalt*: **Verantwortlich nach § 18 Abs. 2 MStV**
- **Fix:** replace each `value: null` with the verified, actual data in the frontmatter of `src/content/legal/impressum.md`. Once the page is complete and reviewed, set `legal.impressumPublished: true` in `src/config/site.config.ts`.

## Blocker 3 — Datenschutzerklärung: draft pending qualified legal review

- **Where:** frontmatter of [`src/content/legal/datenschutz.md`](../src/content/legal/datenschutz.md) — the page has no null fields, but two sections are marked `TEMPLATE — fachkundige rechtliche Prüfung erforderlich` and must be completed by qualified legal counsel before publication:
  - **Kontaktaufnahme** (legal basis, storage duration, recipients for email inquiries)
  - **Ihre Rechte** (data-subject rights: access, rectification, erasure, restriction, portability, objection, complaint to a supervisory authority)
- The page also carries a visible draft banner ("Entwurf — wird derzeit fachkundig geprüft …").
- **Fix:** have the prose reviewed and completed in `src/content/legal/datenschutz.md`, then set `legal.privacyPublished: true` in `src/config/site.config.ts`. The sections that state facts about this site (GitHub Pages hosting, no cookies/analytics/trackers, no external services, self-hosted fonts) are already accurate — see [PRIVACY.md](PRIVACY.md).

## Current state

`src/config/site.config.ts` currently sets `contact.email: null`, `legal.impressumPublished: false`, and `legal.privacyPublished: false`. The pages `/amamus/impressum/` and `/amamus/datenschutz/` are reachable but show the draft banner and blocker markers — that is deliberate and must remain so until the real data is in place.
