import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CSP_POLICY } from '../../src/utils/seo';
import { withBase } from '../../src/utils/paths';
import { siteConfig } from '../../src/config/site.config';
import { home } from '../../src/content/home';

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

describe.skipIf(!distReady)('home sections (Task 8)', () => {
  const html = () => readFileSync('dist/index.html', 'utf8');
  // Astro HTML-escapes text content (& → &amp; etc.), so compare escaped copy.
  const esc = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  it('renders the four section anchors inside <main>', () => {
    const h = html();
    const main = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
    for (const id of ['what-we-do', 'philosophy', 'about', 'contact']) {
      expect(main).toContain(`id="${id}"`);
    }
  });

  it('renders the WhatWeDo intro and all three card titles verbatim', () => {
    const h = html();
    expect(h).toContain(esc(home.whatWeDo.intro));
    expect(home.whatWeDo.cards).toHaveLength(3);
    for (const card of home.whatWeDo.cards) {
      expect(h).toContain(esc(card.title));
      expect(h).toContain(esc(card.text));
    }
  });

  it('renders the philosophy statement, snail note and all 8 theme labels + texts', () => {
    const h = html();
    expect(h).toContain(esc(home.philosophy.statement));
    expect(h).toContain(esc(home.philosophy.body));
    expect(h).toContain(esc(home.philosophy.snailNote));
    expect(home.philosophy.themes).toHaveLength(8);
    for (const theme of home.philosophy.themes) {
      expect(h).toContain(esc(theme.label));
      expect(h).toContain(esc(theme.text));
    }
  });

  it('renders all about paragraphs verbatim', () => {
    const h = html();
    for (const p of home.about.paragraphs) expect(h).toContain(esc(p));
  });

  it('renders the contact placeholder note (email null) and no mailto anywhere', () => {
    const h = html();
    expect(siteConfig.contact.email).toBeNull(); // publication blocker state under test
    expect(h).toContain('contact-placeholder');
    expect(h).toContain(esc(home.contact.placeholder));
    expect(h).not.toContain('mailto:');
  });

  it('renders the footer with base-prefixed legal links and the copyright line', () => {
    const h = html();
    expect(h).toContain('<footer');
    expect(h).toContain(`href="${withBase('/impressum/')}"`); // /amamus/impressum/
    expect(h).toContain(`href="${withBase('/datenschutz/')}"`); // /amamus/datenschutz/
    expect(h).toContain(`© ${new Date().getFullYear()} ${siteConfig.name}`);
    expect(h).toContain(siteConfig.tagline);
  });
});

describe.skipIf(!distReady)('legal pages, 404, robots, sitemap (Task 9)', () => {
  const read = (p: string) => readFileSync(p, 'utf8');

  it('dist/impressum/index.html exists, is German, has blockers and the right canonical', () => {
    expect(existsSync('dist/impressum/index.html')).toBe(true);
    const h = read('dist/impressum/index.html');
    expect(h).toContain('<html lang="de"');
    expect(h).toContain('PUBLICATION BLOCKER');
    expect(h).toContain('legal-blocker');
    expect(h).toContain('legal-draft-banner');
    expect(h).toContain('href="https://amamus.github.io/amamus/impressum/"');
    // footer legal links are wired on the legal pages too
    expect(h).toContain(`href="${withBase('/impressum/')}"`);
    expect(h).toContain(`href="${withBase('/datenschutz/')}"`);
  });

  it('dist/datenschutz/index.html exists, is German, has the draft banner and the right canonical', () => {
    expect(existsSync('dist/datenschutz/index.html')).toBe(true);
    const h = read('dist/datenschutz/index.html');
    expect(h).toContain('<html lang="de"');
    expect(h).toContain('legal-draft-banner');
    expect(h).toContain('href="https://amamus.github.io/amamus/datenschutz/"');
    // factual statements true of this site
    expect(h).toContain('GitHub Pages');
  });

  it('impressum renders one PUBLICATION BLOCKER per missing required field', () => {
    const h = read('dist/impressum/index.html');
    const blockers = h.match(/PUBLICATION BLOCKER:/g) ?? [];
    // Name, Rechtsform, Anschrift, Vertretungsberechtigte Person, Kontakt,
    // Registergericht, Registernummer, USt-IdNr., Verantwortlich nach § 18 Abs. 2 MStV
    expect(blockers.length).toBe(9);
  });

  it('dist/404.html exists, is noindex and links back to /amamus/', () => {
    expect(existsSync('dist/404.html')).toBe(true);
    const h = read('dist/404.html');
    expect(h).toContain('This page wandered off.');
    expect(h).toContain('noindex,follow');
    expect(h).toContain(`href="${withBase('/')}"`); // /amamus/
  });

  it('dist/sitemap.xml is valid XML with exactly the 3 absolute URLs', () => {
    expect(existsSync('dist/sitemap.xml')).toBe(true);
    const xml = read('dist/sitemap.xml');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(
      [
        'https://amamus.github.io/amamus/',
        'https://amamus.github.io/amamus/impressum/',
        'https://amamus.github.io/amamus/datenschutz/',
      ].sort()
    );
    expect(new Set(locs).size).toBe(3); // no duplicates
    expect((xml.match(/<url>/g) ?? []).length).toBe(3);
    for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
      expect(m[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('dist/robots.txt contains the Sitemap line for the /amamus/ base', () => {
    expect(existsSync('dist/robots.txt')).toBe(true);
    const robots = read('dist/robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Sitemap: https://amamus.github.io/amamus/sitemap.xml');
  });
});
