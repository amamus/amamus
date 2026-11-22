import { test, expect } from '@playwright/test';

/**
 * Task 8 — contact section while siteConfig.contact.email is null (the
 * PUBLICATION BLOCKER state): the section must show the clearly non-working
 * placeholder note (role="note", dashed border) and must NOT contain any
 * mailto link — never a fake working contact.
 */
test('contact section shows the placeholder note and zero mailto links', async ({ page }) => {
  await page.goto('/amamus/');
  const contact = page.locator('#contact');
  await expect(contact).toBeVisible();

  const note = contact.getByRole('note');
  await expect(note).toBeVisible();
  await expect(note).toHaveText('Our contact address is being set up and will be published here.');
  await expect(note).toHaveClass(/contact-placeholder/);

  // No working (or broken) contact channel may be rendered while email is null.
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(contact.locator('a')).toHaveCount(0);
  await expect(contact.locator('form')).toHaveCount(0);
});
