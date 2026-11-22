# amamus iocum

amamus iocum builds digital products, invests in promising ideas, and thinks ahead — because a better future should give us more freedom to enjoy life. Take the future seriously. Enjoy the journey.

This repository is the source of the **amamus iocum** corporate website: a fast, privacy-friendly static site built with [Astro](https://astro.build) and published on GitHub Pages at <https://amamus.github.io/amamus/>.

## Brand

The approved logo is [`logo.png`](logo.png) at the repository root (1536×1024 PNG; untracked, kept out of git — the committed reference copy is [`docs/brand/logo-reference.png`](docs/brand/logo-reference.png)). The wordmark is always written exactly **amamus iocum**.

Brand palette (defined once in `src/styles/tokens.css`, consumed everywhere via CSS variables):

| Color | Hex |
| --- | --- |
| Navy | `#0A2463` |
| Sun | `#FFC400` |
| Cream | `#FFF7E6` |
| Sky | `#E8F2FF` |

The vector masters (snail logos, OG image) live in `src/assets/brand/`; the PNG favicons and OG image in `public/` are generated from them with `npm run assets:brand`.

## Quickstart

Requires Node.js >= 22.23.4 (see `engines` in `package.json`).

```bash
npm ci
npm run dev
```

Then open <http://localhost:4321/amamus/> — the dev server runs on Astro's default port 4321 and serves the site under the `/amamus/` base path.

## Scripts

All commands below exist in `package.json`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Astro dev server (<http://localhost:4321/amamus/>) |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Type-check the project (`astro check`) |
| `npm run lint` | ESLint over the whole repository |
| `npm run lint:workflows` | Lint the GitHub Actions workflow files (`scripts/lint-workflows.mjs`) |
| `npm test` | Run all vitest suites (unit + build output) |
| `npm run test:unit` | Unit tests only (`tests/unit`) |
| `npm run test:build` | Build, then run the build-output tests (`tests/build`) |
| `npm run test:e2e` | Playwright end-to-end suite (builds and previews the site automatically) |
| `npm run audit:a11y` | axe-core WCAG 2.2 AA audit; writes reports to `docs/verification/` |
| `npm run audit:lighthouse` | Lighthouse audit of the built site; writes reports to `docs/verification/` |
| `npm run check:links` | Crawl `dist/` and fail on any broken internal link |
| `npm run assets:brand` | Regenerate favicon/OG PNGs from the SVG masters (`scripts/brand-assets.mjs`) |

## Configuration

All site-wide settings live in [`src/config/site.config.ts`](src/config/site.config.ts) — the single source of truth:

- `siteUrl` / `base` — canonical origin and base path. Currently `https://amamus.github.io` + `/amamus/`, so the site is published at <https://amamus.github.io/amamus/>. For a custom domain, set `siteUrl` to that domain (and `base` to `/` if the site is served from the domain root) — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). `astro.config.mjs` mirrors `site`/`base` for the build.
- `contact.email` — currently `postmaster@amamus.net` (owner-provided). While it is `null`, the Contact section on the home page renders a clearly non-working placeholder instead of a contact address — see [docs/LEGAL-BLOCKERS.md](docs/LEGAL-BLOCKERS.md).
- `legal.impressumPublished` / `legal.privacyPublished` — both currently `false`. The legal pages carry visible `PUBLICATION BLOCKER` markers until their required fields are filled in.

The build itself is configured in `astro.config.mjs`: fully static output into `dist/`, stylesheets and assets never inlined (required for the strict CSP).

## Editing content

- Home page copy (hero, "What we do", philosophy, about, contact) lives in [`src/content/home.ts`](src/content/home.ts).
- The legal pages are Markdown files with frontmatter: [`src/content/legal/impressum.md`](src/content/legal/impressum.md) and [`src/content/legal/datenschutz.md`](src/content/legal/datenschutz.md). Fields with `value: null` render as visible `PUBLICATION BLOCKER` markers — never fill them with invented data (see [docs/LEGAL-BLOCKERS.md](docs/LEGAL-BLOCKERS.md)).
- UI strings are in `src/config/i18n.ts`; global styles and the brand palette in `src/styles/`; internal URLs must go through `src/utils/paths.ts` so the base path is applied exactly once.

## Testing and verification

```bash
npm run check                                # types
npm run lint                                 # code style
npm test                                     # unit + build tests
npm run test:e2e                             # end-to-end (Playwright; builds + previews itself)
npm run audit:a11y                           # axe-core WCAG 2.2 AA → docs/verification/
npm run build && npm run audit:lighthouse    # Lighthouse scores → docs/verification/
npm run build && npm run check:links         # internal link check of dist/
```

Committed evidence from the latest runs lives in [`docs/verification/`](docs/verification/README.md) — see its README for what each artifact is and how to regenerate it.

## Deployment

The site deploys automatically to GitHub Pages from `main` via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) (Astro static build → `actions/configure-pages` → `actions/deploy-pages`). The one-time admin setup, the published URL, and the custom-domain procedure are documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Until a custom domain is configured, the site is live at **<https://amamus.github.io/amamus/>**.

## Project structure

```
├── astro.config.mjs          # Astro config: site, base '/amamus/', static output into dist/
├── package.json              # scripts and dependencies
├── public/                   # favicons, robots.txt, og-image.png (served as-is)
├── scripts/                  # brand-assets.mjs, lint-workflows.mjs
├── src/
│   ├── assets/brand/         # SVG masters: snail logos, og-image
│   ├── components/           # Astro components (Header, Hero, sections, LegalBlocker, …)
│   ├── config/               # site.config.ts (single source of truth), i18n.ts
│   ├── content/              # home.ts (home copy) + legal/*.md (impressum, datenschutz)
│   ├── layouts/              # BaseLayout.astro (head, CSP meta, self-hosted fonts)
│   ├── pages/                # index, impressum, datenschutz, 404, sitemap.xml
│   ├── scripts/              # client-side scroll reveal
│   ├── styles/               # tokens.css (brand palette), global.css
│   └── utils/                # paths, seo (CSP), legal, validateConfig
├── tests/                    # unit/, e2e/ (Playwright), build/, scripts/ (lighthouse, link checker)
├── docs/
│   ├── DEPLOYMENT.md         # GitHub Pages setup + custom domain
│   ├── LEGAL-BLOCKERS.md     # open publication blockers and how to resolve them
│   ├── PRIVACY.md            # privacy facts of this site
│   ├── brand/                # logo-reference.png (approved logo copy)
│   └── verification/         # committed audit evidence + README index
└── .github/workflows/        # ci.yml (PR/push checks), deploy-pages.yml (Pages deploy)
```

## Publication blockers

The site is **not yet legally complete**: the contact email is configured (`postmaster@amamus.net`), but 6 legally required Impressum fields and the Datenschutzerklärung's legal-review sections are still open and render as visible `PUBLICATION BLOCKER` markers / draft banner. Do not present the site as legally complete until these are resolved — [docs/LEGAL-BLOCKERS.md](docs/LEGAL-BLOCKERS.md) lists the exact missing fields and where to fill them in.

## Privacy

No analytics, no trackers, no cookies, no external services; fonts are self-hosted and the Content Security Policy is strict. See [docs/PRIVACY.md](docs/PRIVACY.md).

## License

[Apache License 2.0](LICENSE).
