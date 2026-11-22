import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

describe('smoke build output', () => {
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
