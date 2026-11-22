import { test, expect } from '@playwright/test';
import { siteConfig } from '../../src/config/site.config';

/**
 * Task 8/13 — contact section contract, derived from siteConfig.contact.email:
 *   - email set  → exactly one working mailto button, no placeholder note
 *   - email null → PUBLICATION BLOCKER placeholder (role="note", dashed
 *     border) and zero mailto links / forms — never a fake contact channel.
 */
const email = siteConfig.contact.email;

test(`contact section renders the configured state (email ${email ? 'set' : 'null'})`, async ({ page }) => {
  await page.goto('/amamus/');
  const contact = page.locator('#contact');
  await expect(contact).toBeVisible();

  if (email) {
    const link = contact.locator('a[href^="mailto:"]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', `mailto:${email}`);
    await expect(link).toContainText(email);
    await expect(contact.getByRole('note')).toHaveCount(0);
    await expect(contact.locator('.contact-placeholder')).toHaveCount(0);
  } else {
    const note = contact.getByRole('note');
    await expect(note).toBeVisible();
    await expect(note).toHaveClass(/contact-placeholder/);
    await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(contact.locator('a')).toHaveCount(0);
    await expect(contact.locator('form')).toHaveCount(0);
  }
});
