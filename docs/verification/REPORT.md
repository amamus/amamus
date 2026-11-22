# Final verification report — amamus iocum corporate website

**Branch:** `feat/amamus-website` · **HEAD at gate start:** `61b038f` (docs: README, deployment, legal blockers, privacy)
**Worktree:** `/Users/dw/.vibe/worktrees/amamus-04fee4610574/feat-amamus-website`
**Run date:** 2026-11-22, commands executed 16:00–16:07 Europe/Berlin (15:00–15:07 UTC)

## Environment

| Item | Value |
|---|---|
| OS | Darwin 27.2.0 arm64 (macOS) |
| Node | `v26.13.1` |
| npm | `11.20.0` |
| Playwright browser | chromium-1255 at `/Users/dw/Library/Caches/ms-playwright/chromium-1255/chrome-mac-arm64/Google Chrome for Testing.app/...` (already installed — `npx playwright install --with-deps chromium` exited 0 as a no-op) |
| node_modules | pre-installed from `package-lock.json` (all gate commands ran against it) |

## Gate results (real outputs, in execution order)

### 1. `node --version && npm --version`

```
v26.13.1
11.20.0
```

exit 0 — PASS

### 2. `npm run check` (astro check)

```
Result (55 files): 
- 0 errors
- 0 warnings
- 13 hints
```

exit 0 — PASS (the 13 hints are ts(6385) "'z' is deprecated" deprecations from `astro:content` in `src/content.config.ts`)

### 3. `npm run lint` (eslint)

```
> amamus-website@0.1.0 lint
> eslint .
```

exit 0, no findings — PASS

### 4. `npm run lint:workflows`

```
> amamus-website@0.1.0 lint:workflows
> node scripts/lint-workflows.mjs

✓ .github/workflows/ci.yml
✓ .github/workflows/deploy-pages.yml
```

exit 0 — PASS

### 5. `npm run build` (run first — build tests need `dist/`)

```
[build] output: "static"
[build] directory: /Users/dw/.vibe/worktrees/amamus-04fee4610574/feat-amamus-website/dist/
   ├─ /404.html
   ├─ /datenschutz/index.html
   ├─ /impressum/index.html
   ├─ /sitemap.xml
   └─ /index.html
[build] 4 page(s) built in 298ms
[build] Complete!
```

exit 0 — PASS

### 6. `npm run test` (vitest run — unit + build tests)

```
 RUN  v5.1.1 /Users/dw/.vibe/worktrees/amamus-04fee4610574/feat-amamus-website

 ✓ tests/unit/i18n.test.ts (3 tests)
 ✓ tests/unit/styles.test.ts (2 tests)
 ✓ tests/unit/paths.test.ts (5 tests)
 ✓ tests/unit/legal.test.ts (7 tests)
 ✓ tests/unit/seo.test.ts (5 tests)
 ✓ tests/build/buildOutput.test.ts (23 tests)
 ✓ tests/unit/validateConfig.test.ts (4 tests)
 ✓ tests/unit/legalContent.test.ts (19 tests)
 ✓ tests/unit/brandAssets.test.ts (2 tests)
 ✓ tests/build/smoke.test.ts (2 tests)

 Test Files  10 passed (10)
      Tests  72 passed (72)
   Duration  308ms
```

exit 0 — PASS (72/72 across 10 files: 8 unit suites + 2 build-output suites)

### 7. `npm run check:links`

```
check-links: 4 pages, 121 href/src refs checked (base /amamus/)
  internal refs resolved against dist/ OK; 12 meta-only external refs allowlisted (canonical/microdata)
check-links: OK
```

exit 0 — PASS

### 8. `npx playwright install --with-deps chromium` + `npm run test:e2e`

Install: exit 0 with no output — browser already present (see Environment). No download was needed.

```
Running 78 tests using 1 worker
  ✓ [chromium-desktop] … (26 tests, incl. a11y ×4, links ×4, nav-anchors ×4, nav-toggle ×4, noExternalRequests ×4, viewports ×2 …)
  ✓ [chromium-tablet]  … (26 tests)
  ✓ [chromium-mobile]  … (26 tests)

  78 passed (22.6s)
```

(Re-run after the a11y fix below: `78 passed (22.7s)`.)

exit 0 — PASS, all 3 projects: `chromium-desktop` (1440×900), `chromium-tablet` (834×1112), `chromium-mobile` (390×844, mobile emulation). Suites: `a11y`, `contact`, `hero`, `links`, `nav-anchors`, `nav-toggle`, `noExternalRequests`, `reducedMotion`, `viewports`.

### 9. `npm run audit:a11y` (axe-core WCAG 2.2 AA)

```
Running 12 tests using 1 worker
  ✓ [chromium-desktop] › axe-core WCAG 2.2 AA › no violations on /amamus/            (178ms)
  ✓ [chromium-desktop] › … /amamus/impressum/                                        (156ms)
  ✓ [chromium-desktop] › … /amamus/datenschutz/                                      (145ms)
  ✓ [chromium-desktop] › … /amamus/404.html                                           (140ms)
  ✓ [chromium-tablet]  › … (4 routes)                                                (140–177ms)
  ✓ [chromium-mobile]  › … (4 routes)                                                (137–175ms)

  12 passed (4.7s)
```

Committed axe reports `docs/verification/axe-*.json` (12 files = 4 routes × 3 viewports), inspected after the run:

```
axe-chromium-{desktop,tablet,mobile}--amamus-{,-404-html,-datenschutz-,-impressum-}.json:
  violations=0  incomplete=0   (all 12 files)
```

exit 0 — PASS (zero violations **and** zero incomplete/needs-review items after the fix recorded below)

### 10. `npm run audit:lighthouse` (mobile emulation vs `astro preview`)

```
================ Lighthouse scores (mobile) ================
route                              performance     accessibility    best-practices               seo
/amamus/                       100 (target 95)  100 (target 100)    96 (target 95)   100 (target 95)
/amamus/impressum/             100 (target 95)  100 (target 100)    96 (target 95)   100 (target 95)
/amamus/datenschutz/           100 (target 95)  100 (target 100)    96 (target 95)   100 (target 95)
===========================================================
reports written to docs/verification/lighthouse-2026-11-22T15-05-33-487Z-*.{json,html}

lighthouse: OK — all scores meet targets
```

exit 0 — PASS (targets 95/100/95/95 all met or exceeded on every route; best-practices 96 is 1 point above its 95 target)

### 11. `npm audit --production`

```
npm warn config production Use `--omit=dev` instead.
found 0 vulnerabilities
```

exit 0 — PASS (0 vulnerabilities in production dependencies)

## Incident found and fixed during the gate (recorded honestly)

The **first** `npm run audit:a11y` run passed all 12 Playwright tests (the spec fails only on `violations`), but inspecting the freshly written axe JSONs showed `incomplete=1` in the 6 reports for `/amamus/` and `/amamus/404.html` (all viewports):

```
duplicate-id-aria (impact: critical, 1 node):
  "Document has multiple elements referenced with ARIA with the same id attribute: snail-title"
  nodes: <title id="snail-title"> inside the header .logo-mark svg AND the .hero-snail svg
```

**Cause:** `src/assets/brand/snail.svg` carries `<title id="snail-title">` + `aria-labelledby="snail-title"`, and the raw SVG was injected twice per page (header `Logo.astro` + hero `Hero.astro` on home; header `Logo` + body snail on 404) → duplicate id.

**Minimal fix:** the logo mark and the 404 snail are inside `aria-hidden="true"` wrappers (the wrapping link / page carries the accessible name), so the decorative `<title>`/`aria-labelledby` are now stripped at injection time in `src/components/Logo.astro` and `src/pages/404.astro`. The hero snail keeps its `snail-title` (it is the meaningful `role="img"`). Master SVG files untouched.

**Verification after fix (full gate re-run):** check `0 errors / 0 warnings / 13 hints`; lint clean; build `4 page(s) built`; tests `72 passed (72)`; e2e `78 passed (22.7s)`; check:links OK; audit:a11y `12 passed` with `violations=0 incomplete=0` in **all 12** axe JSONs; Lighthouse unchanged (100/100/96/100 on all routes, "OK — all scores meet targets"); `grep -o 'id="snail-title"' dist/index.html` → exactly **1** (hero only), `dist/404.html` and both legal pages → **0**.

## Visual check (screenshots read as images)

Files under `docs/verification/screenshots/` plus `docs/verification/logo-compare.png` and the reference `logo.png` at repo root:

- **Desktop 1440 (`chromium-desktop-home.png`, `-home-full.png`):** clean split hero — eyebrow, h1 "Life is too short for short-term thinking.", intro, two CTAs left; snail in a cream rounded panel right. Inline nav (About / What we do / Philosophy / Contact). Sections What we do (3 cards), Our philosophy (8 numbered values), About, Contact (dashed placeholder note: "Our contact address is being set up and will be published here."), navy footer with reversed logo. No horizontal overflow; typography and spacing consistent.
- **Mobile 390 (`chromium-mobile-home.png`, `-home-full.png`):** hamburger menu button top-right, stacked hero, CTAs fit the viewport, no horizontal overflow (also asserted by `viewports.spec.ts`). Full page stacks cleanly through all sections and footer.
- **Tablet 834 (`chromium-tablet-home.png`):** layout adapts correctly, no overflow.
- **Impressum desktop + mobile (`*-impressum.png`):** draft banner at top and **9 sun-colored `PUBLICATION BLOCKER` markers** (Name, Rechtsform, Anschrift, Vertretungsberechtigte Person, Kontakt, Registergericht, Registernummer, USt-IdNr., Verantwortlich nach § 18 Abs. 2 MStV) render as designed — visible, not hidden. No overflow on mobile.
- **Logo fidelity (`logo-compare.png` + `logo.png`):** side-by-side of the approved reference (left) and the vectorized `src/assets/brand/snail.svg` render (right): same navy `#0A2463` body, `#FFC400` antennae tips, spiral shell, closed-eye smile — a faithful vector redraw (minor proportional differences vs the PNG, not pixel-identical, as expected). The header/hero/footer marks in the screenshots match the reference.

## Evidence files (this directory)

- `axe-*.json` — 12 axe-core reports, regenerated by the final `npm run audit:a11y` (violations=0, incomplete=0 in all).
- `lighthouse-2026-11-22T15-05-33-487Z-{home,impressum,datenschutz}.{json,html}` — final post-fix Lighthouse run (scores above). Older timestamped runs (`14-46-23`, `15-01-58`) are superseded pre-fix/original captures.
- `screenshots/*.png` — 9 viewport screenshots, regenerated by `npm run test:e2e` (Playwright `viewports.spec.ts`).
- `logo-compare.png` — brand fidelity comparison (reference logo left, SVG render right).
- `REPORT.md` (this file), `PR-BODY.md` — evidence index and PR description.

## Could not run

**Nothing.** All 11 gate commands in the task ran to completion in this environment. Note: `npm ci` (mentioned in the original task-13 brief) was not part of this gate's command list; `node_modules` was already installed from `package-lock.json` and every command ran against it successfully.

---

## Addendum 2026-11-22 (later same day) — owner-provided contact/legal data applied

Change: `contact.email` set to `postmaster@amamus.net`; impressum frontmatter filled with owner-provided data (Anschrift `Weserstr. 44d, 10247 Berlin, Germany`, Kontakt `postmaster@amamus.net`, Verantwortlich nach § 18 Abs. 2 MStV `David Walter, Weserstr. 44d, 10247 Berlin, Germany`). Tests updated first (red: 1 failed) then content (green). Remaining null impressum fields: 6 (Name, Rechtsform, Vertretungsberechtigte Person, Registergericht, Registernummer, USt-IdNr.) — owner completes personally.

Gate re-run after the change (real outputs):
- `npm run check` 0 errors; `npm run lint` clean; `npm run build` 4 pages
- `npm test` — 73/73 passed (10 files); `npm run check:links` OK
- `npm run test:e2e` — 78/78 passed (3 projects, 23.7s); contact spec now asserts the working `mailto:postmaster@amamus.net` button
- `npm run audit:a11y` — 12/12 passed, axe WCAG 2.2 AA violations=0 on 4 routes × 3 viewports
- `npm run audit:lighthouse` — 100/100/96/100 on all 3 routes (reports `lighthouse-2026-11-22T18-33-48-121Z-*`)
- dist assertions: `mailto:postmaster@amamus.net` present in `dist/index.html`, zero `contact-placeholder`; `dist/impressum/index.html` contains exactly 6 `PUBLICATION BLOCKER:` markers, the address twice (Anschrift + § 18), `David Walter` once

## Addendum 2 — Pages source switched to GitHub Actions (owner action, 2026-11-22)

`GET repos/amamus/amamus/pages` now returns `build_type: "workflow"` (was `"legacy"`) — the repo owner completed the one-time Settings → Pages → Source = GitHub Actions step. Publication blocker 3 is resolved; `deploy-pages.yml` will publish on merge to `main`.
