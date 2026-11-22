# Deployment — GitHub Pages

The **amamus iocum** website is a fully static Astro build (`output: 'static'`, output directory `dist/`) published on **GitHub Pages via GitHub Actions**. There is no server to maintain: pushing to `main` builds and deploys the site.

- Published URL (until a custom domain is configured): **<https://amamus.github.io/amamus/>**
- Workflow: [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
- CI on pull requests: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

## One-time setup: enable Pages with the Actions source

GitHub Pages must be configured to build from **GitHub Actions** (not from a branch). This is a one-time step that requires **repository admin** rights:

1. Open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
2. Equivalent CLI command an admin (with a write-capable token) can run:

   ```bash
   gh api -X PUT repos/amamus/amamus/pages -f build_type=workflow
   ```

   Note: the token available in the development environment for this project is **pull-only**; with it, the command above returns `404` ("Must have admin rights to Repository"). That is expected — an admin must perform this step once, either via the Settings UI or with a write-capable token.

No `gh-pages` branch or `GITHUB_TOKEN` secret setup is needed: the workflow uses the automatic `GITHUB_TOKEN` with least-privilege permissions (`contents: read`, `pages: write`, `id-token: write`).

## What triggers a deploy

`.github/workflows/deploy-pages.yml` runs on:

- **push to `main`** touching any of: `src/**`, `public/**`, `scripts/**`, `docs/brand/**`, `astro.config.mjs`, `package.json`, `package-lock.json`, `.github/workflows/deploy-pages.yml`
- **manual `workflow_dispatch`** (Actions tab → "Deploy to GitHub Pages" → "Run workflow")

The workflow's `build` job (ubuntu-latest, Node 26) runs `npm ci` → `npm run check` → `npm run lint` → `npm test` → `npm run build`, then `actions/configure-pages@v5` and `actions/upload-pages-artifact@v3` with `path: ./dist`. The `deploy` job then publishes the artifact with `actions/deploy-pages@v4` into the `github-pages` environment. Expect the first deploy to take a few minutes; watch the **Actions** tab for progress and the deployed URL.

Pull requests and pushes to non-`main` branches run `.github/workflows/ci.yml` instead: `npm run check`, `npm run lint`, `npm run lint:workflows`, `npm run build`, `npm test`, `npm run check:links`, then an e2e job (`npx playwright install --with-deps chromium`, `npm run test:e2e`, `npm run audit:a11y`). CI never deploys.

## URL and base path

- `siteUrl` = `https://amamus.github.io`, `base` = `/amamus/` in [`src/config/site.config.ts`](../src/config/site.config.ts) (mirrored as `site`/`base` in [`astro.config.mjs`](../astro.config.mjs)).
- Result: the site is served at **<https://amamus.github.io/amamus/>**, and every internal URL is base-prefixed automatically via `src/utils/paths.ts` (`withBase`/`absoluteUrl`) — never hard-code `/amamus/` anywhere else.
- To roll back, re-run the `deploy` job of a previous successful workflow run in the Actions tab, or revert the commit on `main` and push.

## Custom domain (optional)

1. **DNS**: at your DNS provider, point the domain at GitHub Pages. For an apex domain (`example.com`) use ALIAS/ANAME if supported, otherwise the A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. For a subdomain (`www.example.com`) add a CNAME record pointing to `amamus.github.io`.
2. **Repo setting**: **Settings → Pages → Custom domain** — enter the domain and save. GitHub verifies DNS and provisions a TLS certificate automatically. (Optionally also add a `public/CNAME` file containing the domain; Astro copies `public/` into `dist/`.)
3. **Config**: set `siteUrl` in `src/config/site.config.ts` to `https://<your-domain>` and — if the site is served from the domain root — set `base` to `'/'`. Update `site` (and `base` if changed) in `astro.config.mjs` to match. All canonical/OG/sitemap URLs follow automatically.
4. **Push to `main`** — the workflow rebuilds and redeploys with the new URLs. Enable **Enforce HTTPS** in Settings → Pages once the certificate is active.

## GitHub Pages limits and constraints (relevant to this site)

- **No custom HTTP headers.** GitHub Pages cannot set response headers, so security headers cannot be delivered that way. The site therefore ships its Content Security Policy as a `<meta http-equiv="Content-Security-Policy">` tag (see `src/utils/seo.ts`); all CSS is external and all scripts are bundled, which keeps the CSP strict without `'unsafe-inline'`.
- **HTTPS:** TLS is provisioned automatically, also for custom domains; enable the **Enforce HTTPS** toggle in Settings → Pages to redirect plain HTTP to HTTPS (see the custom-domain step above).
- **Soft limits:** ~100 GB bandwidth per month, **10 builds per hour**, and a **1 GB site size limit**. This site is a few hundred KB, so these are not a practical concern; the 10 builds/hour cap matters only if you push very frequently.
- Pages serves whatever is in the deployed artifact (`dist/`) as-is, and page URLs are case-sensitive.
