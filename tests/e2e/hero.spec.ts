import { test, expect } from '@playwright/test';

test('hero renders approved copy and snail', async ({ page }) => {
  await page.goto('/amamus/');
  await expect(page.getByRole('heading', { level: 1, name: 'Life is too short for short-term thinking.' })).toBeVisible();
  await expect(page.getByText(/We build digital products, invest in promising ideas/)).toBeVisible();
  const snail = page.locator('.hero-snail svg');
  await expect(snail).toBeVisible();
  // Scoped to #main: the header nav has a link with the same name (Task 6),
  // and an unscoped getByRole would strict-mode-violate on desktop/tablet.
  await expect(page.locator('#main').getByRole('link', { name: 'What we do' })).toHaveAttribute('href', '#what-we-do');
});

test('hero snail has idle animation on desktop', async ({ page }) => {
  await page.goto('/amamus/');
  const antennae = page.locator('.hero-snail .antennae');
  await expect(antennae).toHaveCSS('animation-name', /sway/);
});
