// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://amamus.github.io',
  base: '/amamus/',
  output: 'static',
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } }, // never inline assets as data URLs
});
