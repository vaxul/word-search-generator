import { defineConfig } from 'vite';
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
}));
