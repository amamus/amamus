import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const svg = (p: string) => readFileSync(p, 'utf8');

describe('brand assets', () => {
  it('SVG masters exist, parse as SVG, and use brand colors', () => {
    for (const f of ['snail.svg', 'snail-mono.svg', 'snail-reversed.svg', 'og-image.svg']) {
      const s = svg(`src/assets/brand/${f}`);
      expect(s).toContain('<svg');
      expect(s).toMatch(/viewBox="[^"]+"/);
    }
    expect(svg('src/assets/brand/snail.svg')).toContain('#0A2463');
    expect(svg('src/assets/brand/snail.svg')).toContain('#FFC400');
    expect(svg('src/assets/brand/snail.svg')).toContain('class="antennae"');
  });
  it('public icons exist with correct dimensions', async () => {
    expect(existsSync('public/favicon.svg')).toBe(true);
    expect((await sharp('public/favicon-32.png').metadata()).width).toBe(32);
    expect((await sharp('public/apple-touch-icon.png').metadata()).width).toBe(180);
    const og = await sharp('public/og-image.png').metadata();
    expect(og.width).toBe(1200);
    expect(og.height).toBe(630);
  });
});
