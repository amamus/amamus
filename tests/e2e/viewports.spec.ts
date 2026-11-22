import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// Reduced motion so scroll-reveal elements are fully visible in screenshots.
test.use({ reducedMotion: 'reduce' });

const OUT = 'docs/verification/screenshots';

test.beforeAll(() => {
  mkdirSync(OUT, { recursive: true });
});

test.describe('viewports', () => {
  test('home has no horizontal scroll and screenshots are captured', async ({ page }, testInfo) => {
    await page.goto('/amamus/');
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(
      scrollWidth,
      `horizontal overflow on /amamus/ at ${testInfo.project.name}: scrollWidth=${scrollWidth} innerWidth=${innerWidth}`
    ).toBeLessThanOrEqual(innerWidth + 1);

    await page.screenshot({ path: `${OUT}/${testInfo.project.name}-home.png` });
    await page.screenshot({ path: `${OUT}/${testInfo.project.name}-home-full.png`, fullPage: true });
  });

  test('impressum screenshot is captured', async ({ page }, testInfo) => {
    await page.goto('/amamus/impressum/');
    await page.screenshot({ path: `${OUT}/${testInfo.project.name}-impressum.png`, fullPage: true });
  });
});
