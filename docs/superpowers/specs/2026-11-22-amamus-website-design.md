# amamus iocum — Corporate Website Design Spec

- **Date:** 2026-11-22
- **Status:** Approved design (brainstorming completed; hero = split + snail, motion = subtle CSS idle + scroll reveals, contact = config-gated placeholder, verification = Playwright + axe-core + Lighthouse)
- **Repo:** `amamus/amamus` · **Deployment:** GitHub Pages at `https://amamus.github.io/amamus/` (base path `/amamus/`)
- **Approved brand input:** `logo.png` (1536×1024 PNG, untracked in repo root) — the snail formed from `a` (shell) + `i` (head/body), navy `#0A2463`, sun-yellow `#FFC400` antenna tips, closed eyes + smile, flowing navy baseline. **Do not redesign it.**

## 1. Goals and non-goals

**Goals:** production-ready, responsive, accessible (WCAG 2.2 AA), fast (Lighthouse targets: Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95, SEO ≥ 95), visually distinctive corporate site for amamus iocum; static generation; minimal client JS; no trackers/cookies/external requests; reviewed PR delivery.

**Non-goals:** no backend, no forms, no analytics, no client-side framework, no i18n framework (English launch; structure must make German localization easy later), no custom domain (but config must not assume one), no invented facts (people, history, portfolio, revenue, addresses, legal data).

## 2. Architecture

- **Stack:** Astro (latest, v7 line) + TypeScript strict + modern CSS (custom properties, no preprocessor) + vanilla JS in small Astro component scripts. Static output (`output: 'static'`).
- **Package manager:** npm (lockfile committed). Scripts: `dev`, `build`, `preview`, `check` (astro check), `lint`, `test` (vitest), `test:e2e` (playwright), `audit:a11y`, `audit:lighthouse`, `check:links`.
- **Repo structure:**

```
├── .github/workflows/deploy-pages.yml     # least-privilege Pages deployment
├── public/                                # favicon.svg, apple-touch-icon.png, robots.txt, og-image.png, fonts fallbacks
├── src/
│   ├── assets/brand/                      # SVG logo masters + generated PNG/ICO derivatives
│   ├── components/                        # design-system components (see §4)
│   ├── content/                           # content collections: pages, legal
│   │   ├── config.ts                      # collection schemas
│   │   ├── pages/…  legal/…
│   ├── config/site.config.ts              # single source of truth: site URL, base, brand, contact, nav, legal flags
│   ├── layouts/BaseLayout.astro           # head/meta/SEO/skip-link/fonts
│   ├── pages/                             # index.astro, impressum.astro, datenschutz.astro, 404.astro
│   ├── styles/tokens.css                  # design tokens (colors, type scale, spacing, radii, shadows, motion)
│   ├── styles/global.css                  # reset, base elements, utilities
│   └── utils/                             # pure helpers (tested with Vitest): seo.ts, paths.ts, legal.ts, content.ts
├── tests/                                 # vitest unit tests + playwright e2e + a11y/lighthouse scripts
├── docs/superpowers/specs|plans/          # this spec + implementation plan
└── astro.config.mjs, tsconfig.json, vitest.config.ts, playwright.config.ts
```

- **Base path:** `site: 'https://amamus.github.io'`, `base: '/amamus/'` in `astro.config.mjs`; all internal links via Astro's `import.meta.env.BASE_URL` / `Astro.site` helpers in `src/utils/paths.ts` — never hard-coded `/amamus/`. Custom domain later = change `site` only.
- **Content:** Astro content collections with zod schemas for `pages` (title, description, sections) and `legal` (structured fields with explicit `status: 'missing'` markers). English strings live in content files; a `src/config/i18n.ts` holds nav labels etc. so German can be added as a second dictionary without dependency changes.
- **Fonts:** `@fontsource-variable/inter` + `@fontsource-variable/nunito-sans` imported in BaseLayout (self-hosted woff2, `font-display: swap`, preloaded critical weights only). No external font requests.

## 3. Brand system

### 3.1 Logo assets (SVG masters in `src/assets/brand/`)

All variants traced faithfully from `logo.png` geometry (same shapes, proportions, colors — vectorized, not redesigned):

| Asset | File | Use |
|---|---|---|
| Primary snail | `snail.svg` | hero, about |
| Horizontal lockup | `logo-horizontal.svg` (snail + "amamus iocum" wordmark) | header (desktop) |
| Stacked lockup | `logo-stacked.svg` | footer, OG fallback |
| Icon only | `snail-icon.svg` | favicon source, small spaces |
| Monochrome | `snail-mono.svg` (currentColor) | print/embeds |
| Reversed | `snail-reversed.svg` (white/cream on navy) | dark sections/footer |
| Favicon | `public/favicon.svg` (+ generated 32px ICO/PNG) | browser tab |
| Apple touch icon | `public/apple-touch-icon.png` (180×180, generated from icon) | iOS |
| Social graphic | `public/og-image.png` (1200×630) + `og-image.svg` source | Open Graph/Twitter |

Wordmark set in Nunito Sans ExtraBold lowercase, navy; on dark backgrounds reversed variant. Vectorization approach: hand-authored clean SVG paths measured against the PNG (programmatic pixel analysis of `logo.png` to extract bounding boxes/curves), visually diffed against the original at multiple sizes.

### 3.2 Design tokens (`src/styles/tokens.css`)

```css
--color-navy: #0A2463; --color-sun: #FFC400; --color-cream: #FFF7E6;
--color-sky: #E8F2FF; --color-white: #FFFFFF;
--color-ink: #0A2463;            /* body text on light */
--color-ink-soft: rgba(10,36,99,.72);
--color-surface: #FFFFFF; --color-surface-warm: var(--color-cream); --color-surface-cool: var(--color-sky);
--font-heading: 'Nunito Sans Variable', system-ui, sans-serif;
--font-body: 'Inter Variable', system-ui, sans-serif;
--step--1 … --step-5 (fluid type scale), --space-* scale, --radius-* , --shadow-*,
--motion-duration-fast/base/slow, --ease-out;
```

No raw hex outside `tokens.css` (lint rule / review-enforced). Snail geometry reused subtly: rounded "shell" radii on cards, a thin flowing baseline rule (SVG wave) as section dividers, circular sun-yellow dots as list markers.

### 3.3 Typography

Nunito Sans (headings, weights 700–900), Inter (body/UI, 400–600), fluid `clamp()` scale, generous line-height (1.6 body), max measure ~65ch.

## 4. Component design system (`src/components/`)

- `BaseLayout.astro` — doctype, lang="en", meta/OG/Twitter/canonical/JSON-LD (via `utils/seo.ts`), skip link, font preloads, header, footer, `<slot/>`.
- `Header.astro` — sticky, translucent white backdrop-blur; horizontal logo; nav: About, What we do, Philosophy, Contact (anchor links to home sections); mobile: hamburger button (aria-expanded, aria-controls), disclosure panel, Esc closes, focus trap-lite (return focus), keyboard accessible; tiny inline script.
- `Hero.astro` — split grid: left headline "Life is too short for short-term thinking." + intro paragraph + CTA link; right: snail SVG in a cream rounded panel with subtle CSS idle animation (antennae sway, gentle bob; `@media (prefers-reduced-motion: reduce)` disables).
- `Section.astro` — section wrapper w/ id, eyebrow label, heading, prose.
- `WhatWeDo.astro` — three connected-but-distinct cards (Digital Products & Services / Investments / Financial Independence), each with small custom SVG glyph echoing shell geometry.
- `Philosophy.astro` — editorial two-column: statement + theme list (financial independence, patient capital, entrepreneurship, digital autonomy, freedom of choice, quality of life, long-term thinking, enjoyment) with snail-metaphor copy ("progress at your own pace…").
- `About.astro` — company description; explicit "what we don't claim" (no invented people/history/portfolio).
- `Contact.astro` — reads `site.config.ts` `contact.email`; if set → mailto button; if empty → clearly non-working placeholder state ("Our contact address will be published here.") — **publication blocker**, no broken form/mailto.
- `Footer.astro` — stacked/reversed logo, nav repeat, legal links (Impressum, Datenschutz), copyright line with dynamic year.
- `SnailDivider.astro` — flowing baseline SVG divider between sections.
- `Reveal.astro` (or `data-reveal` + one tiny script) — IntersectionObserver adds `.is-visible`; no-JS = content visible by default (progressive enhancement).
- `LegalBlock.astro` — renders legal fields; missing required fields render as visible `PUBLICATION BLOCKER` markers (never plausible fake data).

## 5. Pages and content

- `/` (index): Header → Hero → What we do → Philosophy → About → Contact → Footer.
- `/impressum/`, `/datenschutz/`: German legal pages, structured from `content/legal/*` with every legally required field either filled from verified data (none available yet) or marked `status: 'missing'` → rendered as explicit blocker. **Publication blocker documented.**
- `/404.astro`: friendly snail "this page wandered off" + home link.
- Copy tone: intelligent, playful-mature, independent, optimistic, long-term; no VC clichés, no hype, no invented claims. Approved lines: hero H1 "Life is too short for short-term thinking."; intro: "We build digital products, invest in promising ideas, and think ahead. Because a better future should give us more freedom to enjoy life." Tagline: "Take the future seriously. Enjoy the journey."

## 6. Motion and interaction

CSS keyframes only for idle motion (antennae sway ~6s, bob ~4s, ease-in-out, transform-only). Scroll reveals via IntersectionObserver + CSS transitions (opacity/translate, transform-only). All motion disabled under `prefers-reduced-motion: reduce`; no parallax; no autoplay media. JS budget: header toggle + reveal observer only (~<2KB min+gzip total inline/module).

## 7. Accessibility (WCAG 2.2 AA)

Semantic landmarks (header/nav/main/footer), one h1, logical heading order, skip link, visible focus indicators (navy outline + sun offset), contrast ≥ 4.5:1 (navy on white/cream/sky all pass; sun yellow used only for non-text accents or with navy text on top), keyboard-operable nav (Esc, focus return), aria-current on nav, alt/aria-label on logo SVGs (decorative duplicates aria-hidden), form-free, reduced motion, target size ≥ 24px, verified with axe-core + manual keyboard pass + Playwright checks.

## 8. SEO, metadata, privacy

Per-page title/description via `utils/seo.ts`; canonical = `Astro.site` + base-aware path; OG/Twitter cards from `public/og-image.png`; `sitemap.xml` (Astro integration `@astrojs/sitemap` with `site` + base), `robots.txt` (allow all + sitemap URL), `lang="en"` + hreflang-ready structure, JSON-LD `Organization` with only verified facts (name "amamus iocum", url, logo). Privacy: no analytics, no cookies, no external requests (fonts self-hosted, images local), CSP meta as defense-in-depth, `referrerpolicy`. Security: `npm audit` in CI, lockfile, workflow pinned by tag with least-privilege `permissions`, no secrets beyond Actions-provided `GITHUB_TOKEN`; document GitHub Pages limits (no custom headers/CSP via headers, HTTPS enforced by Pages).

## 9. Deployment — GitHub Pages

`.github/workflows/deploy-pages.yml`: on push to `main` (paths-filtered) + workflow_dispatch; job builds with Node 26 (setup-node, version from lockfile `packageManager` field, npm cache), `npm ci`, `npm run build`, then `actions/configure-pages`, `actions/upload-pages-artifact` (path `./dist`), `actions/deploy-pages`. `permissions: contents: read, pages: write, id-token: write`; `concurrency: pages` group. Enable Pages source = GitHub Actions in repo settings (documented in PR; may need one manual step if API perms allow `gh api`).

## 10. Testing and verification strategy

- **Unit (Vitest):** `utils/paths.ts` (base-path join/canonical under `/amamus/`), `utils/seo.ts` (titles, canonical, OG), `utils/legal.ts` (blocker detection), content schema validation, config validation (fails build if required config missing/invalid).
- **TDD:** utilities written red-green-refactor; components verified via build + DOM snapshot tests where logic exists.
- **E2E (Playwright, downloaded Chromium):** desktop 1440×900, tablet 834×1112, mobile 390×844 — nav toggle keyboard flow, anchor links, all internal links resolve (also `check:links` script crawling `dist/`), images/fonts load under `/amamus/` prefix, no console errors, no external requests.
- **A11y:** `@axe-core/cli` (or playwright-axe) on all routes, WCAG 2.2 AA ruleset; manual keyboard pass checklist.
- **Performance:** Lighthouse CI (via Playwright chromium, `CHROME_PATH`) on `/`, `/impressum/`, `/datenschutz/`; targets ≥95/100/≥95/≥95; report stored in `docs/verification/`.
- **Build:** `astro check` (0 errors), `npm run build` clean, `npm audit --production` clean-high.

## 11. Publication blockers (explicit, must not be hidden)

1. **Contact email:** not provided → config empty → Contact section shows non-working placeholder state until a verified address is set in `src/config/site.config.ts`.
2. **Impressum:** legally required German company information (name, legal form, address, registration, VAT, responsible person) not provided → every missing field rendered as `PUBLICATION BLOCKER` marker; page must not be treated as legally valid.
3. **Datenschutzerklärung:** no verified privacy processes → structured template with blockers, not compliance-claiming text.

## 12. Out of scope / later

German localization (structure ready), custom domain, blog/news, portfolio pages (no verified investments exist), any analytics.
