// `vitest/config` re-exports Vite's `defineConfig` with the extra `test` field
// typed, so the single config file drives both the Vite build and the Vitest
// run (no second config to keep in sync). (spec-scaffold.md, Decision log)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project page under the repo-name path, so the
// production build must be prefixed with `/word-search-generator/`. Dev keeps
// `/` so the local server works at the root. (spec-scaffold.md, Prior decisions)
// Tailwind v4 integrates via its first-party Vite plugin (no PostCSS config).
// vite.config requires a default export.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/word-search-generator/' : '/',
  plugins: [react(), tailwindcss()],
  // Vitest: jsdom for React component tests; jest-dom matchers loaded once via
  // the setup file. No `globals` — tests import from 'vitest' explicitly so
  // TypeScript and ESLint see real bindings, not ambient globals.
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
}));
