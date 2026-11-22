import { test, expect } from '@playwright/test';

/**
 * Task 8 — desktop anchor navigation. Clicking each link in the main nav must
 * update the URL hash and bring the target section into the viewport, with its
 * h2 heading below the sticky header (section[id] carries scroll-margin-top:
 * var(--header-height) = 4.5rem = 72px, added in global.css by Task 7).
 *
 * Pinned to the desktop viewport per the Task 8 ruling; the mobile/tablet
 * projects still run this file but the pinned 1440x900 viewport makes the
 * assertions identical everywhere.
 */

const NAV = [
  { label: 'About', hash: '#about' },
  { label: 'What we do', hash: '#what-we-do' },
  { label: 'Philosophy', hash: '#philosophy' },
  { label: 'Contact', hash: '#contact' },
] as const;

test.describe('nav anchor scrolling', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const item of NAV) {
    test(`"${item.label}" sets ${item.hash} and shows the section heading below the header`, async ({ page }) => {
      await page.goto('/amamus/');
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: item.label })
        .click();
      await expect(page).toHaveURL(new RegExp(`${item.hash}$`));
      const section = page.locator(`main section${item.hash}`);
      await expect(section).toBeInViewport();
      const heading = section.getByRole('heading', { level: 2 });
      await expect(heading).toBeVisible();
      const box = await heading.boundingBox();
      // 72px = --header-height; scroll-margin-top keeps the heading clear of it
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(72);
    });
  }
});
