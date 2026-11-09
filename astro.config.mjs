import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://mushfikurahmaan.com',
  outDir: process.env.CONTENT_ROOT ? 'dist-fixture' : 'dist',
  output: 'static',
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
