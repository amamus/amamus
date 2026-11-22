import { test, expect } from '@playwright/test';

const PAGES = ['/amamus/', '/amamus/impressum/', '/amamus/datenschutz/', '/amamus/404.html'];

test.describe('internal links', () => {
  for (const route of PAGES) {
    test(`${route} has a title, one h1 and only working internal links`, async ({ page, request }) => {
      const response = await page.goto(route);
      expect(response?.status(), `GET ${route}`).toBe(200);

      // Every page must have a non-empty <title>.
      expect((await page.title()).trim().length).toBeGreaterThan(0);

      // Every page, including the 404, must have exactly one h1.
      expect(await page.locator('h1').count(), `${route} h1 count`).toBe(1);

      // Collect every internal a[href] and request each one.
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((els) =>
          els
            .map((a) => a.getAttribute('href'))
            .filter((h): h is string => typeof h === 'string' && h.length > 0)
        );
      const internal = [...new Set(hrefs.filter((h) => h.startsWith('/')))];
      expect(internal.length, `${route} should link internally`).toBeGreaterThan(0);

      for (const href of internal) {
        const path = href.split('#')[0]?.split('?')[0] || '/';
        const res = await request.get(path);
        expect(res.status(), `link ${href} referenced on ${route}`).toBe(200);
      }
    });
  }
});
