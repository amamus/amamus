import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// The site ships a strict CSP (script-src 'self') via <meta>, which blocks
// Playwright's inline addScriptTag below. bypassCSP only lifts CSP inside this
// test browser context — the shipped pages are unchanged, and
// noExternalRequests.spec.ts independently proves nothing external is fetched.
// Reduced motion is set so scroll-reveal elements are fully visible when axe
// runs (otherwise below-the-fold [data-reveal] elements sit at ~0 opacity and
// axe reports false-positive color-contrast on the mid-fade state).
test.use({ bypassCSP: true, reducedMotion: 'reduce' });

const ROUTES = ['/amamus/', '/amamus/impressum/', '/amamus/datenschutz/', '/amamus/404.html'];

test.describe('axe-core WCAG 2.2 AA', () => {
  for (const route of ROUTES) {
    test(`no violations on ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await page.addScriptTag({ content: axeSource });
      const results = await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- axe is injected at runtime
        (window as any).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        })
      );
      mkdirSync('docs/verification', { recursive: true });
      writeFileSync(
        `docs/verification/axe-${testInfo.project.name}-${route.replace(/[^a-z0-9]+/gi, '-')}.json`,
        JSON.stringify(results, null, 2)
      );
      expect(results.violations).toEqual([]);
    });
  }
});
