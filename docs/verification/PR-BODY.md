# feat: amamus iocum corporate website (Astro → GitHub Pages)

## Summary

Fully static corporate website for **amamus iocum** ("Life is too short for short-term thinking."), built with **Astro 7** (`output: 'static'`) and deployed to **GitHub Pages via GitHub Actions** at <https://amamus.github.io/amamus/>. Four routes: home (`/`), `/impressum/`, `/datenschutz/`, and a friendly `404`. Zero runtime dependencies beyond Astro itself, self-hosted variable fonts, strict CSP via meta tag, no cookies/analytics/trackers/external requests.

## Design overview

- **Brand:** approved snail logo (`logo.png`) vectorized to `src/assets/brand/snail.svg` (+ `snail-reversed.svg` for the navy footer, `snail-mono.svg`, generated icons/OG image). Palette: navy `#0A2463`, sun `#FFC400`, cream — enforced by a style lint test that rejects non-brand hex in CSS.
- **Typography:** self-hosted variable fonts (Inter Variable for body, Nunito Sans for headings) via `@fontsource-variable/*` — no external font requests.
- **Layout:** responsive single-page home with sticky accessible header (desktop inline nav, mobile toggle with `aria-expanded`/Esc/focus-return), split hero with idle-animated snail (transform-only, disabled under `prefers-reduced-motion`), sections *What we do* (3 activity cards), *Our philosophy* (8 values), *About*, *Contact*, and a navy footer. Fluid type scale via design tokens; verified no horizontal overflow at 1440 / 834 / 390.

## Implementation details

- **Stack:** Astro 7.4 static build → `dist/`; `site`/`base` = `https://amamus.github.io` + `/amamus/` in `astro.config.mjs`, mirrored in `src/config/site.config.ts`; all internal URLs go through `withBase()`/`absoluteUrl()` (`src/utils/paths.ts`).
- **Structure:** `src/layouts/BaseLayout.astro` (SEO meta, canonical/OG/Twitter, schema.org Organization microdata, `<meta http-equiv="Content-Security-Policy">`, theme-color, skip link), components `Header`, `Logo`, `Hero`, `Section`, `WhatWeDo`, `Philosophy`, `About`, `Contact`, `Footer`, `SnailDivider`, `LegalBlocker`; pages `index`, `impressum`, `datenschutz`, `404`; legal content as typed content collections (`src/content/legal/*.md`, zod schema in `src/content.config.ts`) with `legalField()` classifying missing (`null`) fields.
- **CI/CD:** `.github/workflows/ci.yml` (PRs + non-main pushes: check, lint, lint:workflows, build, test, check:links, Playwright e2e + axe) and `.github/workflows/deploy-pages.yml` (push to `main` → build → `actions/configure-pages@v5` → `upload-pages-artifact@v3` → `deploy-pages@v4`, least-privilege `GITHUB_TOKEN`: `contents: read`, `pages: write`, `id-token: write`). Both workflows pass `scripts/lint-workflows.mjs`.
- **Tests:** 72 vitest tests (8 unit suites: paths, seo, legal, legalContent, i18n, styles, validateConfig, brandAssets; 2 build-output suites asserting the built HTML) + 78 Playwright e2e tests across 3 viewport projects (a11y, links, nav-anchors, nav-toggle incl. keyboard, hero, contact state, reduced motion, no-external-requests, viewport screenshots + no-overflow assertion) + link checker + axe audit + Lighthouse harness.

## Screenshots

Repo-relative paths (rendered by GitHub in this PR body):

- Desktop 1440, above the fold: `docs/verification/screenshots/chromium-desktop-home.png`
- Desktop 1440, full page: `docs/verification/screenshots/chromium-desktop-home-full.png`
- Tablet 834, full page: `docs/verification/screenshots/chromium-tablet-home-full.png`
- Mobile 390, above the fold: `docs/verification/screenshots/chromium-mobile-home.png`
- Mobile 390, full page: `docs/verification/screenshots/chromium-mobile-home-full.png`
- Impressum (publication-blocker markers visible): `docs/verification/screenshots/chromium-desktop-impressum.png`, `docs/verification/screenshots/chromium-mobile-impressum.png`
- Logo fidelity (approved `logo.png` left vs rendered SVG right): `docs/verification/logo-compare.png`

## Test results (full gate, 2026-11-22, branch `feat/amamus-website`)

Environment: macOS Darwin 27.2.0 arm64, Node `v26.13.1`, npm `11.20.0`. Full evidence with raw outputs: `docs/verification/REPORT.md`.

| Command | Result |
|---|---|
| `node --version && npm --version` | `v26.13.1` / `11.20.0` |
| `npm run check` (astro check) | 0 errors, 0 warnings, 13 hints (55 files) |
| `npm run lint` (eslint) | clean, exit 0 |
| `npm run lint:workflows` | ✓ ci.yml, ✓ deploy-pages.yml |
| `npm run build` | 4 pages built (`/`, `/impressum/`, `/datenschutz/`, `/404.html` + sitemap) |
| `npm run test` (vitest) | **72/72 tests passed, 10/10 files** |
| `npm run check:links` | 4 pages, 121 refs checked, 12 meta-only external refs allowlisted — OK |
| `npm run test:e2e` (Playwright, 3 projects) | **78/78 passed (22.7s)** — chromium-desktop 1440×900, chromium-tablet 834×1112, chromium-mobile 390×844 |
| `npm run audit:a11y` (axe WCAG 2.2 AA) | **12/12 passed; `violations=0` and `incomplete=0` in all 12 axe JSON reports** (4 routes × 3 viewports) |
| `npm run audit:lighthouse` | see performance below — all targets met |
| `npm audit --production` | **found 0 vulnerabilities** |

## Accessibility findings

- axe-core WCAG 2.2 AA (`wcag2a/aa`, `wcag21a/aa`, `wcag22aa`): **zero violations on all 4 routes × 3 viewports** (`docs/verification/axe-*.json`).
- During the final gate, axe initially flagged `duplicate-id-aria` (needs-review) on home/404 because the snail SVG's `<title id="snail-title">` was injected twice per page (header logo + hero/404). Fixed minimally by stripping the decorative title/`aria-labelledby` in the `aria-hidden` logo/404 injections; re-run shows `violations=0, incomplete=0` everywhere (details in `REPORT.md`).
- Keyboard-operable mobile nav (toggle, `aria-expanded`, Esc closes, focus returns, visible focus indicator), skip link, one `h1` per page, `aria-labelledby` section headings, `prefers-reduced-motion` disables snail animation and scroll reveals, color contrast passes axe on all routes.

## Performance results

Lighthouse (mobile emulation, `docs/verification/lighthouse-2026-11-22T15-05-33-487Z-*.json/html`):

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/amamus/` | **100** (target 95) | **100** (target 100) | **96** (target 95) | **100** (target 95) |
| `/amamus/impressum/` | **100** | **100** | **96** | **100** |
| `/amamus/datenschutz/` | **100** | **100** | **96** | **100** |

The site makes **no non-localhost requests** at runtime (asserted by an e2e suite): self-hosted fonts, inlined SVG brand assets, no third-party scripts.

## Remaining limitations

- GitHub Pages cannot set HTTP response headers, so security headers are shipped as a strict `<meta http-equiv="Content-Security-Policy">` (no `'unsafe-inline'`) instead of response headers.
- Lighthouse best-practices is 96/100 (target 95) — the remaining point is inherent to static Pages hosting.
- Screenshots/logo comparison are desktop/tablet/mobile Chromium only; no real-device or other-browser matrix in CI.
- 10 builds/hour soft limit on GitHub Pages (not a concern for this site's size, ~a few hundred KB).

## ⚠️ PUBLICATION BLOCKERS (must be resolved before presenting the site as legally complete)

See **`docs/LEGAL-BLOCKERS.md`** for the full list and fix instructions. In short:

1. ~~**`contact.email = null`**~~ **RESOLVED 2026-11-22:** `contact.email = 'postmaster@amamus.net'` (owner-provided); the Contact section now renders a working `mailto:` button (pinned by e2e + build tests).
2. **6 null legal fields remain** in `src/content/legal/impressum.md` — Name, Rechtsform, Vertretungsberechtigte Person, Registergericht, Registernummer, USt-IdNr. (the owner completes these personally). Anschrift (`Weserstr. 44d, 10247 Berlin, Germany`), Kontakt (`postmaster@amamus.net`) and Verantwortlich nach § 18 Abs. 2 MStV (`David Walter, Weserstr. 44d, 10247 Berlin, Germany`) were filled with owner-provided data on 2026-11-22. Each remaining null renders as a visible sun-colored **`PUBLICATION BLOCKER`** marker on `/amamus/impressum/`. `legal.impressumPublished: false`. The datenschutz page has no null fields but carries a draft banner and two `TEMPLATE` sections (Kontaktaufnahme, Ihre Rechte) pending qualified legal review; `legal.privacyPublished: false`.
3. **GitHub Pages source must be set to "GitHub Actions" by a repo admin** (one-time): the token available in the dev environment is pull-only, so `gh api -X PUT repos/amamus/amamus/pages -f build_type=workflow` returns `404` ("Must have admin rights to Repository"). Exact admin command and UI steps: **`docs/DEPLOYMENT.md`**.

## Deployment instructions

1. Admin (write-capable token or Settings UI): **Settings → Pages → Build and deployment → Source → GitHub Actions**, or `gh api -X PUT repos/amamus/amamus/pages -f build_type=workflow` (see `docs/DEPLOYMENT.md`; pull-only tokens get 404).
2. Merge this PR into `main`. `.github/workflows/deploy-pages.yml` runs on push to `main`, builds (`npm ci` → check → lint → test → build) and deploys `dist/` to Pages with the least-privilege `GITHUB_TOKEN`. CI on the PR itself is green-path via `.github/workflows/ci.yml` (never deploys).
3. Site goes live at **<https://amamus.github.io/amamus/>**. Optional custom domain: DNS + Settings → Pages → Custom domain, then update `siteUrl`/`base` (`docs/DEPLOYMENT.md`).
4. Resolve the publication blockers above (real contact email, verified impressum data, legal review of the privacy sections, flip `impressumPublished`/`privacyPublished`) and push to `main` — the blocker markers disappear automatically once real data is in place.

**Not done in this PR:** no merge and no auto-merge — the branch is pushed and this PR is opened for human review only; deployment to Pages happens solely after a maintainer merges to `main`.
