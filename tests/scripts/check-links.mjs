#!/usr/bin/env node
/**
 * check-links.mjs — static link checker for the built site.
 *
 * Crawls every .html file under dist/, extracts all href/src attributes, and:
 *   - resolves internal references against the Astro `base` ('/amamus/')
 *     and fails if the target file does not exist in dist/
 *     ('/' -> index.html, '/x/' -> x/index.html, '/x' -> x.html or x/index.html,
 *     relative refs resolve against the containing HTML file);
 *   - fails on ANY external http(s) src/href unless it is on a meta-only
 *     element that browsers never fetch: <link rel="canonical"> and
 *     <link itemprop="..."> (schema.org microdata). og:/twitter: URLs live in
 *     content= attributes and are never checked here.
 *
 * Fragments (#id), mailto:/tel: and other non-http schemes are skipped.
 *
 * Usage: npm run build && npm run check:links   (exit 1 with a list on failure)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

// Base path comes from the single source of truth (src/config/site.config.ts).
const siteConfigSrc = readFileSync(join(ROOT, 'src/config/site.config.ts'), 'utf8');
const BASE = (siteConfigSrc.match(/base:\s*'([^']+)'/)?.[1]) ?? '/';

/** Recursively collect all .html files under dist/. */
function collectHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectHtml(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out.sort();
}

const OPEN_TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
const ATTR_RE = /([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

/** Yield { tag, attrs } for every opening tag, skipping raw <script>/<style> bodies. */
function* scanTags(html) {
  OPEN_TAG_RE.lastIndex = 0;
  let m;
  while ((m = OPEN_TAG_RE.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const rawAttrs = m[2];
    const attrs = {};
    ATTR_RE.lastIndex = 0;
    let a;
    while ((a = ATTR_RE.exec(rawAttrs)) !== null) {
      attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    }
    yield { tag, attrs };
    if ((tag === 'script' || tag === 'style') && !attrs.src && !attrs.href) {
      // skip raw text content of inline script/style
      const close = html.indexOf(`</${tag}`, OPEN_TAG_RE.lastIndex);
      OPEN_TAG_RE.lastIndex = close === -1 ? html.length : close;
    }
  }
}

/** External URLs are only tolerated on elements browsers never fetch. */
function isMetaOnlyExternal(tag, attrs) {
  if (tag !== 'link') return false;
  const rel = (attrs.rel ?? '').toLowerCase();
  if (rel.split(/\s+/).includes('canonical')) return true;
  if (attrs.itemprop !== undefined) return true; // schema.org microdata
  return false;
}

/** Map a root-relative URL path to a file inside dist/. Returns null if missing. */
function resolveInternal(urlPath) {
  let p = urlPath;
  if (BASE !== '/' && p.startsWith(BASE)) p = p.slice(BASE.length - 1); // keep leading '/'
  if (!p.startsWith('/')) p = '/' + p;
  const noHashQuery = p.split('#')[0].split('?')[0];
  const candidates = [];
  const clean = noHashQuery.endsWith('/') ? noHashQuery.slice(0, -1) : noHashQuery;
  if (clean === '') candidates.push('index.html');
  else {
    candidates.push(`${clean}.html`, `${clean}/index.html`, clean);
  }
  for (const c of candidates) {
    const full = join(DIST, c);
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

const errors = [];
const pages = collectHtml(DIST);
let refCount = 0;
let externalAllowed = 0;

for (const file of pages) {
  const relFile = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  for (const { tag, attrs } of scanTags(html)) {
    for (const attr of ['href', 'src']) {
      const value = attrs[attr];
      if (!value) continue;
      refCount++;
      const v = value.trim();
      if (v.startsWith('#')) continue; // same-page fragment
      if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(v)) continue;
      if (/^(https?:)?\/\//i.test(v)) {
        if (isMetaOnlyExternal(tag, attrs)) {
          externalAllowed++;
          continue;
        }
        errors.push(`${relFile}: external ${attr} not allowed: ${v} (<${tag}>)`);
        continue;
      }
      if (v.startsWith('/')) {
        if (resolveInternal(v) === null) {
          errors.push(`${relFile}: missing local target for ${attr}="${v}"`);
        }
      } else {
        // relative reference — resolve against the containing HTML file
        const target = join(file, '..', v.split('#')[0].split('?')[0]);
        if (!existsSync(target)) {
          errors.push(`${relFile}: missing local target for ${attr}="${v}"`);
        }
      }
    }
  }
}

console.log(`check-links: ${pages.length} pages, ${refCount} href/src refs checked (base ${BASE})`);
console.log(`  internal refs resolved against dist/ OK; ${externalAllowed} meta-only external refs allowlisted (canonical/microdata)`);

if (errors.length > 0) {
  console.error(`\ncheck-links: FAILED — ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('check-links: OK');
