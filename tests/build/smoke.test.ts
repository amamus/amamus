import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

// Build-output tests are skipped on fresh clones (no dist/) so plain
// `npm test` passes; run `npm run test:build` to build first, then test.
const distReady = existsSync('dist/index.html');

describe.skipIf(!distReady)('smoke build output', () => {
  it('dist/index.html exists and contains the brand name', () => {
    expect(existsSync('dist/index.html')).toBe(true);
    expect(readFileSync('dist/index.html', 'utf8')).toContain('amamus iocum');
  });
  it('asset URLs are prefixed with the /amamus/ base', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    // any src/href to local assets must start with /amamus/
    const localRefs = [...html.matchAll(/(?:src|href)="(\/(?!\/)[^"]*)"/g)].map((m) => m[1] ?? '');
    for (const ref of localRefs) expect(ref.startsWith('/amamus/')).toBe(true);
  });
});
