# Verification evidence

Committed artifacts from the latest verification runs (captured **2026-11-22**, branch `feat/amamus-website`, HEAD at the time: `1fd0218`). Regenerate any of them with the commands below — every command exists in `package.json`.

## axe-core accessibility reports — `axe-*.json` (12 files)

- **What:** full axe-core results (JSON) for each route × each Playwright viewport project. Routes: `/amamus/`, `/amamus/impressum/`, `/amamus/datenschutz/`, `/amamus/404.html`. Projects: `chromium-desktop` (1440×900), `chromium-tablet` (834×1112), `chromium-mobile` (390×844, mobile emulation).
- **Naming:** `axe-<project>-<route-slug>.json`, where the route slug replaces non-alphanumerics with `-` (e.g. `/amamus/404.html` → `amamus-404-html`).
- **Ruleset:** WCAG 2.2 AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) — see `tests/e2e/a11y.spec.ts`.
- **Result at capture:** `violations: []` (zero violations) in all 12 files.
- **Regenerate:** install the browser once (`npx playwright install --with-deps chromium`), then:

  ```bash
  npm run audit:a11y
  ```

  Playwright builds and previews the site automatically (see `playwright.config.ts` `webServer`), runs `tests/e2e/a11y.spec.ts`, overwrites the `axe-*.json` files here, and fails the run if any violation appears.

## Lighthouse reports — `lighthouse-*.json` / `lighthouse-*.html` (6 files)

- **What:** Lighthouse JSON + HTML reports per route (slugs `home`, `impressum`, `datenschutz`), mobile emulation, run against `astro preview` on `localhost:4321`. Naming: `lighthouse-<timestamp>-<route>.{json,html}`.
- **Scores at capture (2026-11-22):** performance **100**, accessibility **100**, best-practices **96**, SEO **100** on all three routes. Enforced targets (the script exits 1 below them): performance 95, accessibility 100, best-practices 95, SEO 95 — see `tests/scripts/lighthouse.mjs`.
- **Regenerate:**

  ```bash
  npm run build && npm run audit:lighthouse
  ```

  The script spawns its own `astro preview`, writes new timestamped reports into this directory, and prints the four category scores per page.

## Viewport screenshots — `screenshots/` (9 PNGs)

- **What:** screenshots captured by `tests/e2e/viewports.spec.ts` per viewport project: `<project>-home.png` (above the fold), `<project>-home-full.png` (full page), `<project>-impressum.png` (full page) for `chromium-desktop`, `chromium-tablet`, `chromium-mobile`. The same spec also asserts there is no horizontal overflow at any viewport.
- **Regenerate:**

  ```bash
  npm run test:e2e
  ```

  (Playwright's `webServer` builds and previews the site first; install the browser once with `npx playwright install --with-deps chromium`.)

## Brand fidelity comparison — `logo-compare.png`

- **What:** side-by-side comparison of the approved reference logo (`logo.png` at the repo root, left) and the vectorized `src/assets/brand/snail.svg` rendered to PNG via sharp (right), produced during brand implementation to verify the SVG faithfully matches the approved logo.
- **Regenerate:** not covered by an npm script — recreate manually with `sharp` (already a devDependency) if the SVG masters change, and keep the reference on the left.

## Link checking — no artifact

`npm run check:links` (`tests/scripts/check-links.mjs`) crawls every `.html` file under `dist/`, resolves all internal `href`/`src` against the `/amamus/` base, and fails on any broken internal reference or any external `http(s)` URL that a browser would fetch. It prints to the console only; regenerate/verify with:

```bash
npm run build && npm run check:links
```

## Related suites (no committed artifacts)

- `npm test` / `npm run test:unit` / `npm run test:build` — vitest unit and build-output tests (console output only).
- `npm run test:e2e` — the full Playwright suite (nav, anchors, contact state, reduced motion, no-external-requests, viewports/screenshots, a11y is split out as `npm run audit:a11y`).
