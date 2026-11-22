import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', '.astro/**'] },
];
