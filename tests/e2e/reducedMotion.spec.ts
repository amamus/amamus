import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('reduced motion disables snail animation and reveals', async ({ page }) => {
  await page.goto('/amamus/');
  await expect(page.locator('.hero-snail .antennae')).toHaveCSS('animation-name', 'none');
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.scrollIntoView()));
  for (const el of await page.locator('[data-reveal]').all()) {
    await expect(el).toBeVisible();
    await expect(el).not.toHaveClass(/reveal-pending/);
  }
});
