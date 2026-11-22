// Generates the PNG brand assets from the SVG masters using sharp (librsvg).
// Run with: npm run assets:brand
import { mkdirSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

mkdirSync('public', { recursive: true });

const faviconSvg = readFileSync('public/favicon.svg');
const ogSvg = readFileSync('src/assets/brand/og-image.svg');

// favicon-32.png — 32x32, transparent background
await sharp(faviconSvg).resize(32, 32).png().toFile('public/favicon-32.png');

// apple-touch-icon.png — 180x180 cream rounded square with the snail centered.
// Rendered in a single pass (composite blend modes mangle alpha); favicon.svg
// viewBox is "390 155 728 698", so scale 140/728 and center in the 180x180 tile.
const ICON = 180;
const inner = faviconSvg
  .toString()
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}" viewBox="0 0 ${ICON} ${ICON}">` +
  `<rect width="${ICON}" height="${ICON}" rx="40" fill="#FFF7E6"/>` +
  `<g transform="translate(20,23) scale(0.19231) translate(-390,-155)">${inner}</g></svg>`;
await sharp(Buffer.from(iconSvg)).png().toFile('public/apple-touch-icon.png');

// og-image.png — 1200x630 social card rendered from og-image.svg
await sharp(ogSvg).resize(1200, 630).png().toFile('public/og-image.png');

console.log('brand assets generated: public/favicon-32.png, public/apple-touch-icon.png, public/og-image.png');
