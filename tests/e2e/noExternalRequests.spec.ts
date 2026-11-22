import { test, expect } from '@playwright/test';

const ROUTES = ['/amamus/', '/amamus/impressum/', '/amamus/datenschutz/', '/amamus/404.html'];

/**
 * The site must be fully self-hosted: every subresource (scripts, styles,
 * fonts, images, preloads, XHR) must come from localhost. Canonical/OG
 * meta URLs are never fetched by the browser, so they cannot appear here.
 */
test.describe('no external requests', () => {
  for (const route of ROUTES) {
    test(`no non-localhost requests while loading ${route}`, async ({ page }) => {
      const external: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (!/^https?:/i.test(url)) return; // data:, blob:, about: are not network requests
        const host = new URL(url).hostname;
        if (host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]') {
          external.push(url);
        }
      });

      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500); // catch late/lazy requests

      expect(external, `external requests on ${route}: ${external.join(', ')}`).toEqual([]);
    });
  }
});
