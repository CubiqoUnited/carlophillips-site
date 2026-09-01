import { resolve } from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'apps/web/src'),
      '@repo/product-pipeline': resolve(
        __dirname,
        'packages/product-pipeline/src/index.ts'
      ),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
