import { test, expect } from '@playwright/test';

/**
 * Task 6 — header navigation toggle behaviour (section-independent).
 *
 * Per the plan, this spec deliberately contains NO scroll-to-section
 * assertions: the #about/#what-we-do/#philosophy/#contact sections only land
 * with Task 8, which ships its own tests/e2e/nav-anchors.spec.ts. Here we
 * assert the header/nav contract that exists independent of page sections:
 * inline desktop nav, mobile toggle button, aria-expanded, Escape close +
 * focus return, and link-click close.
 *
 * Every test pins its own viewport so it behaves identically on all three
 * Playwright projects (desktop 1440x900, tablet 834x1112, mobile 390x844).
 */

const NAV = [
  { label: 'About', hash: '#about' },
  { label: 'What we do', hash: '#what-we-do' },
  { label: 'Philosophy', hash: '#philosophy' },
  { label: 'Contact', hash: '#contact' },
];

test.describe('header navigation', () => {
  test('desktop shows inline nav with all anchors, menu button hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/amamus/');
    for (const item of NAV) {
      // Scoped to the header nav ("Main"): the footer added a second nav
      // landmark with the same links in Task 8.
      const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: item.label });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', new RegExp(`${item.hash}$`));
    }
    await expect(page.getByRole('button', { name: /menu/i })).toBeHidden();
  });

  test('mobile menu: button toggles, aria-expanded, Esc closes, focus returns', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/amamus/');
    const btn = page.getByRole('button', { name: /menu/i });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-nav')).toBeHidden();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-nav')).toBeHidden();
    await expect(btn).toBeFocused();
  });

  test('keyboard: Enter opens menu, activating a link closes it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/amamus/');
    const btn = page.getByRole('button', { name: /menu/i });
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-nav')).toBeVisible();
    // Section anchors landed with Task 8 — here we only assert that
    // activating a menu link closes the menu again. Scoped to the header
    // nav ("Main") because the footer nav repeats the same link names.
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-nav')).toBeHidden();
  });

  test('focus indicator is visible', async ({ page }) => {
    await page.goto('/amamus/');
    await page.keyboard.press('Tab'); // skip link first
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });
});
