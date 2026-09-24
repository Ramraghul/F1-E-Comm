import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Vite/Rollup can't statically resolve named exports through the `shared`
      // package's compiled CommonJS `export *` chains (that build exists for the
      // Node/CommonJS server). Aliasing straight to the TS source lets esbuild bundle
      // it directly as real ESM, which resolves named exports correctly.
      '@shopswift/shared': path.resolve(dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
  },
});
