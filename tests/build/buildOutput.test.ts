import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CSP_POLICY } from '../../src/utils/seo';
import { withBase } from '../../src/utils/paths';
import { siteConfig } from '../../src/config/site.config';

// Build-output tests are skipped on fresh clones (no dist/) so plain
// `npm test` passes; run `npm run test:build` to build first, then test.
const distReady = existsSync('dist/index.html');

describe.skipIf(!distReady)('BaseLayout head', () => {
  const html = () => readFileSync('dist/index.html', 'utf8');

  it('has lang, title, description, canonical under /amamus/', () => {
    const h = html();
    expect(h).toContain('<html lang="en"');
    expect(h).toContain('<title>amamus iocum</title>');
    expect(h).toMatch(/<meta name="description" content="[^"]+"/);
    expect(h).toContain('<link rel="canonical" href="https://amamus.github.io/amamus/"');
  });

  it('has charset, viewport, robots and theme-color', () => {
    const h = html();
    expect(h).toMatch(/<meta charset="utf-8"/);
    expect(h).toMatch(/<meta name="viewport" content="[^"]+"/);
    expect(h).toContain('<meta name="robots" content="index,follow"');
    expect(h).toContain(`<meta name="theme-color" content="${siteConfig.brand.themeColor}"`);
  });

  it('has Open Graph and Twitter meta', () => {
    const h = html();
    expect(h).toContain('property="og:title"');
    expect(h).toContain('property="og:description"');
    expect(h).toContain('property="og:type" content="website"');
    expect(h).toContain('property="og:url" content="https://amamus.github.io/amamus/"');
    expect(h).toContain('property="og:image" content="https://amamus.github.io/amamus/og-image.png"');
    expect(h).toContain('property="og:locale" content="en_US"');
    expect(h).toContain(`property="og:site_name" content="${siteConfig.name}"`);
    expect(h).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('has schema.org Organization microdata with only verified facts', () => {
    const h = html();
    expect(h).toContain('itemscope');
    expect(h).toContain('itemtype="https://schema.org/Organization"');
    expect(h).toContain('itemprop="name"');
    expect(h).toContain('amamus iocum');
    expect(h).toContain('itemprop="url"');
    expect(h).toContain('itemprop="logo"');
  });

  it('has no inline scripts or styles (strict CSP compatible)', () => {
    const h = html();
    expect(h).not.toContain('<style');
    for (const m of h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/g)) {
      expect(m[0]).toContain('src=');
    }
  });

  it('has CSP meta with the strict policy, favicon links, skip link, font preloads', () => {
    const h = html();
    expect(h).toContain('http-equiv="Content-Security-Policy"');
    expect(h).toContain(`content="${CSP_POLICY}"`);
    expect(h).toContain('rel="icon"');
    expect(h).toContain('apple-touch-icon');
    expect(h).toContain('class="skip-link"');
    expect(h).toMatch(/rel="preload"[^>]*as="font"/);
  });

  it('links favicon.svg, favicon-32.png and apple-touch-icon.png via withBase', () => {
    const h = html();
    expect(h).toContain(`href="${withBase('/favicon.svg')}"`);
    expect(h).toContain(`href="${withBase('/favicon-32.png')}"`);
    expect(h).toContain(`href="${withBase('/apple-touch-icon.png')}"`);
  });

  it('preloads the two self-hosted variable fonts under the site base', () => {
    const h = html();
    const fontPreloads = [...h.matchAll(/<link\b[^>]*\bas="font"[^>]*>/g)].map((m) => m[0]);
    expect(fontPreloads).toHaveLength(2);
    for (const tag of fontPreloads) {
      expect(tag).toContain('rel="preload"');
      expect(tag).toContain('type="font/woff2"');
      expect(tag).toContain('crossorigin');
      const href = /href="([^"]+)"/.exec(tag)?.[1] ?? '';
      expect(href.startsWith(withBase('/'))).toBe(true); // /amamus/
      expect(href.endsWith('.woff2')).toBe(true);
    }
  });

  it('ships all CSS externally (no <style>) with @font-face for the variable fonts', () => {
    const h = html();
    const cssLinks = [...h.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1] ?? '');
    expect(cssLinks.length).toBeGreaterThan(0);
    for (const href of cssLinks) expect(href.startsWith(withBase('/'))).toBe(true);
    const cssFiles = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'));
    expect(cssFiles.length).toBeGreaterThan(0);
    const css = cssFiles.map((f) => readFileSync(join('dist/_astro', f), 'utf8')).join('\n');
    expect(css).toContain('@font-face');
    expect(css).toContain('Inter Variable');
    expect(css).toContain('Nunito Sans Variable');
    const woff2 = readdirSync('dist/_astro').filter((f) => f.endsWith('.woff2'));
    expect(woff2.length).toBeGreaterThanOrEqual(2);
  });

  it('starts the body with the skip link, then the microdata block', () => {
    const h = html();
    expect(h).toMatch(/<a class="skip-link" href="#main">/);
    const body = h.slice(h.indexOf('<body'));
    expect(body.indexOf('class="skip-link"')).toBeLessThan(body.indexOf('itemscope'));
  });

  it('references only same-origin assets (CSP-safe)', () => {
    const h = html();
    // capture the host only (not the path) of every absolute src/href
    const refs = [...h.matchAll(/(?:src|href)="(https?:)?\/\/([^/"]+)"/g)].map((m) => m[2] ?? '');
    for (const host of refs) expect(host).toBe('amamus.github.io');
  });
});
