import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_TOKENS = [
  '--color-navy', '--color-sun', '--color-cream', '--color-sky', '--color-white',
  '--font-heading', '--font-body', '--motion-fast', '--motion-base', '--ease-out',
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe('design tokens', () => {
  it('tokens.css defines all required custom properties', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    for (const t of REQUIRED_TOKENS) expect(css).toContain(`${t}:`);
  });
  it('brand hex values appear only in tokens.css', () => {
    const files = walk('src').filter((f) => /\.(css|astro)$/.test(f));
    for (const f of files) {
      if (f.endsWith('tokens.css')) continue;
      const content = readFileSync(f, 'utf8');
      for (const hex of ['#0A2463', '#FFC400', '#FFF7E6', '#E8F2FF']) {
        expect(content.toLowerCase()).not.toContain(hex.toLowerCase());
      }
    }
  });
});
