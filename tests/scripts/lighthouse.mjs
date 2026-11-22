#!/usr/bin/env node
/**
 * lighthouse.mjs — performance/SEO/a11y audit of the built site.
 *
 * Spawns `astro preview` on :4321 itself, waits for readiness, then runs the
 * Lighthouse node API (mobile emulation) with the Playwright-provided Chromium
 * against the main routes. Writes JSON + HTML reports to
 * docs/verification/lighthouse-<timestamp>-<route>.{json,html}, prints the four
 * category scores per page, and exits 1 if any score is below target
 * (performance 95, accessibility 100, best-practices 95, seo 95).
 *
 * Usage: npm run build && npm run audit:lighthouse
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const OUT_DIR = join(ROOT, 'docs/verification');
const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const ROUTES = [
  { path: '/amamus/', slug: 'home' },
  { path: '/amamus/impressum/', slug: 'impressum' },
  { path: '/amamus/datenschutz/', slug: 'datenschutz' },
];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const TARGETS = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 95 };

const { chromium } = await import('playwright');
const CHROME_PATH = chromium.executablePath();

function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {}
      if (Date.now() > deadline) return reject(new Error(`server at ${url} not ready within ${timeoutMs}ms`));
      setTimeout(tick, 500);
    };
    tick();
  });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // 1. Start the preview server ourselves.
  console.log(`lighthouse: starting preview server on :${PORT} ...`);
  const preview = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let previewLog = '';
  preview.stdout.on('data', (d) => (previewLog += d));
  preview.stderr.on('data', (d) => (previewLog += d));

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  let chrome;
  const failures = [];
  const summary = [];

  try {
    await waitForServer(`${BASE_URL}/amamus/`);
    console.log('lighthouse: preview server ready');

    // 2. Launch Chromium (Playwright's build) for Lighthouse to drive.
    chrome = await launch({
      chromePath: CHROME_PATH,
      chromeFlags: ['--headless', '--disable-dev-shm-usage'],
    });
    console.log(`lighthouse: chromium at ${CHROME_PATH} (port ${chrome.port})`);

    // 3. Audit each route (mobile emulation is Lighthouse's default; set explicitly).
    for (const route of ROUTES) {
      const url = `${BASE_URL}${route.path}`;
      console.log(`\nlighthouse: auditing ${url} ...`);
      const result = await lighthouse(url, {
        port: chrome.port,
        output: ['json', 'html'],
        onlyCategories: CATEGORIES,
        emulatedFormFactor: 'mobile',
        logLevel: 'error',
      });
      const lhr = result.lhr;
      const reports = Array.isArray(result.report) ? result.report : [result.report];
      // output order matches the requested outputs: json first, html second
      const [jsonReport, htmlReport] = reports;
      writeFileSync(join(OUT_DIR, `lighthouse-${stamp}-${route.slug}.json`), jsonReport ?? JSON.stringify(lhr, null, 2));
      writeFileSync(join(OUT_DIR, `lighthouse-${stamp}-${route.slug}.html`), htmlReport ?? '');

      const scores = {};
      for (const cat of CATEGORIES) {
        scores[cat] = Math.round((lhr.categories[cat]?.score ?? 0) * 100);
      }
      summary.push({ route: route.path, url, scores });
      console.log(`  scores: ${CATEGORIES.map((c) => `${c}=${scores[c]}`).join('  ')}`);
      for (const cat of CATEGORIES) {
        if (scores[cat] < TARGETS[cat]) {
          failures.push(`${route.path}: ${cat} score ${scores[cat]} < target ${TARGETS[cat]}`);
        }
      }
    }
  } finally {
    if (chrome) {
      try {
        chrome.kill();
      } catch {}
    }
    preview.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
    if (!preview.killed) preview.kill('SIGKILL');
  }

  // 4. Report.
  console.log('\n================ Lighthouse scores (mobile) ================');
  console.log('route'.padEnd(28) + CATEGORIES.map((c) => c.padStart(18)).join(''));
  for (const row of summary) {
    console.log(
      row.route.padEnd(28) +
        CATEGORIES.map((c) => `${row.scores[c]} (target ${TARGETS[c]})`.padStart(18)).join('')
    );
  }
  console.log('===========================================================');
  console.log(`reports written to docs/verification/lighthouse-${stamp}-*.{json,html}`);

  if (failures.length > 0) {
    console.error(`\nlighthouse: FAILED — below target:\n  - ${failures.join('\n  - ')}`);
    process.exit(1);
  }
  console.log('\nlighthouse: OK — all scores meet targets');
}

main().catch((err) => {
  console.error('lighthouse: ERROR', err);
  process.exit(1);
});
